# 物品を返却する機能

- [物品を返却する機能](#物品を返却する機能)
  - [機能詳細](#機能詳細)
  - [シーケンス図](#シーケンス図)

## 機能詳細

Slack から返却メッセージを送信し，物品を返却する

## シーケンス図

```mermaid
sequenceDiagram
    participant ユーザー
    participant Slack
    participant SlackApp as Slack App
    participant Controller as コントローラー
    participant DB as データベース
    participant Sheet as スプレッドシート
    participant Queue as キュー/ジョブワーカー
    participant Admin as 管理者通知

    %% 1. Slack受信 -> ACK
    ユーザー ->> Slack: 返却メッセージを送信
    Slack ->> SlackApp: イベント送信
    SlackApp -->> Slack: 200 OK (ACK)  -- note: 即時応答

    %% 2. リクエスト受け取り
    SlackApp ->> Controller: 返却リクエスト (user_id, public_id, req_id, condition)

    %% 3. 同期確認: Sheet vs DB
    Controller ->> Sheet: get_last_updated_timestamp()
    Sheet -->> Controller: sheet_ts
    Controller ->> DB: SELECT MAX(event_at) FROM equipment_history WHERE equipment_id = ?  -- latest_history_ts
    DB -->> Controller: latest_history_ts

    alt sheet_ts > latest_history_ts (シートが新しい)
        Controller ->> Sheet: download_latest_equipment_row(public_id)
        Sheet -->> Controller: equipment_row_data
        Controller ->> DB: BEGIN TRANSACTION
        Controller ->> DB: MERGE/UPDATE equipments USING equipment_row_data
        Controller ->> DB: INSERT INTO equipment_history (...) -- record sync from sheet
        Controller ->> DB: COMMIT
        Controller ->> SlackApp: "同期完了（Sheet→DB）。返却処理を続行します。"
    else latest_history_ts > sheet_ts (DBが新しい)
        Controller ->> DB: SELECT equipment_row_data FROM equipments WHERE public_id = ?
        DB -->> Controller: equipment_row_data
        Controller ->> Sheet: update_row(public_id, equipment_row_data)
        alt Sheet 更新成功
            Sheet -->> Controller: OK
            Controller ->> SlackApp: "同期完了（DB→Sheet）。返却処理を続行します。"
        else Sheet 更新失敗
            Controller ->> Queue: enqueue_retry_sync(public_id, equipment_row_data, req_id)
            Queue ->> Admin: 同期失敗アラート (public_id, req_id)
            Controller ->> SlackApp: "同期に問題が発生しましたが、DBは最新です。返却処理を続行します。"
        end
    else
        Controller ->> SlackApp: "データは同期済み。返却処理を続行します。"
    end

    %% 4. 返却処理（排他ロック + 検証）
    Controller ->> DB: BEGIN TRANSACTION
    Controller ->> DB: SELECT * FROM equipments WHERE public_id = ? FOR UPDATE
    DB -->> Controller: equipment_row
    alt 物品が存在しない
        Controller ->> DB: ROLLBACK
        Controller ->> SlackApp: 返却不可（存在しない）
        Controller ->> DB: INSERT INTO equipment_history (...) -- record failed return attempt
    else
        %% 返却者検証（貸出者と一致するか or 管理者権限）
        Controller ->> DB: check current user_id (equipment_row.user_id)
        alt requestor != equipment_row.user_id and not is_admin(requestor)
            Controller ->> DB: ROLLBACK
            Controller ->> SlackApp: 返却不可（権限不足）
            Controller ->> DB: INSERT INTO equipment_history (...) -- record unauthorized attempt
        else
            %% 状態確認（現在貸出中であること）
            Controller ->> DB: if equipment_row.status != 'borrowed' then rollback & reply
            alt equipment_row.status != 'borrowed'
                Controller ->> DB: ROLLBACK
                Controller ->> SlackApp: 返却不可（現在貸出中ではない）
                Controller ->> DB: INSERT INTO equipment_history (...) -- record inconsistency
            else
                %% オプション: 返却時の状態確認（破損/遅延）
                opt check_condition_and_late_fee
                    Controller ->> Controller: calculate late_fee, damage_flag using due_date and condition
                end

                %% 実際の更新：状態をavailableに戻す、使用者クリア、返却日時など
                Controller ->> DB: UPDATE equipments SET status='available', user_id=NULL, last_returned_by=?, last_returned_at=NOW(), updated_at=NOW() WHERE id=?
                Controller ->> DB: INSERT INTO equipment_history (equipment_id, event_type, old_value, new_value, changed_by, event_at, notes) VALUES (...)
                Controller ->> DB: COMMIT

                Controller ->> SlackApp: 返却完了(成功) -- include late_fee/damage info if any

                %% 5. スプレッドシート同期は非同期キューへ
                Controller ->> Queue: enqueue "sync_sheet" (equipment_id, req_id)
                alt damage_flag == true
                    Queue ->> Admin: 破損報告アラート (equipment_id, req_id, details)
                end
            end
        end
    end

    %% 6. キューワーカーでスプレッドシート同期（非同期）
    Queue ->> Sheet: 更新要求 (equipment_id, new_state)
    alt Sheet 更新成功
        Sheet -->> Queue: OK
    else Sheet 更新失敗
        Queue -->> Queue: retry backoff (n回)
        alt retry exhausted
            Queue ->> Admin: 同期失敗アラート (equipment_id, err, req_id)
            Queue ->> Controller: "同期失敗だがDBは更新済み"（オプションでユーザー通知）
        end
    end

```
