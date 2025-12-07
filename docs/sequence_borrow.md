# 物品を借りる機能

- [物品を借りる機能](#物品を借りる機能)
  - [機能詳細](#機能詳細)
  - [シーケンス図](#シーケンス図)

## 機能詳細

Slack から貸し出しメッセージを送信し，物品を借りる

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
    ユーザー ->> Slack: 貸し出しメッセージを送信
    Slack ->> SlackApp: イベント送信
    SlackApp -->> Slack: 200 OK (ACK)  -- note: 即時応答

    %% 2. リクエスト受け取り（req_id を付与）
    SlackApp ->> Controller: 貸し出しリクエスト (user_id, public_id, req_id)

    %% 3. 同期確認: スプレッドシート vs DB の最新タイムスタンプを取得
    Controller ->> Sheet: get_last_updated_timestamp()
    Sheet -->> Controller: sheet_ts (最終更新日時)
    Controller ->> DB: SELECT MAX(event_at) FROM equipment_history WHERE equipment_id = ?  -- latest_history_ts
    DB -->> Controller: latest_history_ts

    alt sheet_ts > latest_history_ts (シートの方が新しい)
        %% sheet -> DB 同期 (先に反映してから貸出処理)
        Controller ->> Sheet: download_latest_equipment_row(public_id)
        Sheet -->> Controller: equipment_row_data
        Controller ->> DB: BEGIN TRANSACTION
        Controller ->> DB: MERGE/UPDATE equipments USING equipment_row_data (-> reflect sheet changes)
        Controller ->> DB: INSERT INTO equipment_history (...) -- record sync from sheet
        Controller ->> DB: COMMIT
        Controller ->> SlackApp: "同期完了（Sheet→DB）。貸し出し処理を続行します。"
    else latest_history_ts > sheet_ts (DBの方が新しい)
        %% DB -> Sheet 同期（ここでは同期を試み同期後に貸出; 非同期選択も可）
        Controller ->> DB: SELECT equipment_row_data FROM equipments WHERE public_id = ?
        DB -->> Controller: equipment_row_data
        Controller ->> Sheet: update_row(public_id, equipment_row_data)
        alt Sheet 更新成功
            Sheet -->> Controller: OK
            Controller ->> DB: INSERT INTO equipment_history (...) -- record sync to sheet (optional)
            Controller ->> SlackApp: "同期完了（DB→Sheet）。貸し出し処理を続行します。"
        else Sheet 更新失敗
            %% 同期失敗はリトライ or アラート。ここではリトライ後に続行するパターンを示す
            Controller ->> Queue: enqueue_retry_sync(public_id, equipment_row_data, req_id)
            Queue ->> Admin: 同期失敗アラート (public_id, req_id)
            Controller ->> SlackApp: "同期に問題が発生しましたが、DBは最新です。貸し出しを続行します（同期は別途処理）。"
        end
    else
        %% 同期済み（同じタイムスタンプ）
        Controller ->> SlackApp: "データは同期済み。貸し出し処理を続行します。"
    end

    %% 4. 本来の貸出処理（同期完了後に行う）
    Controller ->> DB: BEGIN TRANSACTION
    Controller ->> DB: SELECT * FROM equipments WHERE public_id = ? FOR UPDATE
    DB -->> Controller: equipment_row
    alt 物品が存在しない
        Controller ->> DB: ROLLBACK
        Controller ->> SlackApp: 貸し出し不可（存在しない）
        Controller ->> DB: INSERT INTO equipment_history (...) -- record failed attempt
    else
        Controller ->> DB: check status
        alt status != 'available'
            Controller ->> DB: ROLLBACK
            Controller ->> SlackApp: 貸し出し不可（利用中等）
            Controller ->> DB: INSERT INTO equipment_history (...) -- record failed attempt
        else status == 'available'
            Controller ->> DB: UPDATE equipments SET status='borrowed', user_id=?, due_date=?, updated_at=NOW()
            Controller ->> DB: INSERT INTO equipment_history (equipment_id, event_type, old_value, new_value, changed_by, event_at) VALUES (...)
            Controller ->> DB: COMMIT
            Controller ->> SlackApp: 貸し出し完了(成功)
            %% 5. スプレッドシートは非同期または同期で更新（ここでは非同期キュー）
            Controller ->> Queue: enqueue "sync_sheet" (equipment_id, req_id)
        end
    end

    %% 6. キューワーカーがスプレッドシート同期を実行（非同期）
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
