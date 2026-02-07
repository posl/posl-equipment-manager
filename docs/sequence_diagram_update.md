# 物品情報を更新する機能

- [物品情報を更新する機能](#物品情報を更新する機能)
  - [機能詳細](#機能詳細)
  - [シーケンス図](#シーケンス図)

## 機能詳細

Slack から情報更新メッセージを送信し，物品情報を更新する

## シーケンス図

```mermaid
sequenceDiagram
    participant ユーザー
    participant Slack
    participant SlackApp as Slack App
    participant Controller as コントローラー
    participant DB as データベース
    participant Admin as 管理者通知

    %% 1. Slackでリクエスト送信
    ユーザー ->> Slack: 情報更新リクエストを送信
    Slack ->> SlackApp: リクエスト送信
    SlackApp ->> SlackApp: request_idを生成
    SlackApp -->> Slack: "物品情報更新リクエストを受け付けました．"

    %% 2. リクエスト受け取り
    SlackApp ->> Controller: 更新リクエストを渡す
    Controller ->> DB: 同じrequest_idが存在するか確認
    alt 既に存在
        Controller ->> SlackApp: "このリクエストは既に処理されています．"
        Controller ->> Admin: "情報更新リクエストが重複して送信されました．"
    end

    %% 3. 入力バリデーション
    Controller ->> Controller: 入力項目に不備がないか確認
    alt 入力に不備がある場合
        Controller ->> SlackApp: "入力内容に不備があります．"
        Controller ->> Admin: "情報更新リクエストの入力内容に不備があるため，情報更新処理が失敗しました．"
    end

    %% 4. 更新処理を実行
    %% Controller ->> DB: BEGIN TRANSACTION
    Controller ->> DB: 物品情報を取得
    alt 物品が存在しない
        Controller ->> DB: equipment_history: request_typeをupdate，response_statusをrejected，error_codeをRULE_NOT_FOUND，changed_byをrequest_user_idとして記録
        Controller ->> SlackApp: "物品が存在しないため，情報更新ができません．"
        Controller ->> Admin: "物品が存在しないため，情報更新処理が失敗しました．"
    else 物品が存在する
        alt category，category_indexのUNIQUE制約違反
            Controller ->> DB: equipment_history: request_typeをupdate，response_statusをrejected，error_codeをRULE_DUPLICATE_CATEGORY_INDEX，changed_byをrequest_user_idとして記録
            Controller ->> SlackApp: "{category}{category_index} は既に登録されています．"
            Controller ->> Admin: "category，category_indexのUNIQUE制約違反により，情報更新処理が失敗しました．"
        else 成功
            Controller ->> DB: equipmentsを更新
            Controller ->> DB: equipment_history: request_typeをupdate，response_statusをsuccess，error_codeをNONE，changed_byをrequest_user_idとして記録
            Controller ->> SlackApp: "{category}{category_index}: 情報更新"
            Controller ->> Admin: "情報更新処理が完了しました．"
        end
    end
    %% Controller ->> DB: COMMIT

```
