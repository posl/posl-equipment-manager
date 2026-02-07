# 物品を返却する機能

- [物品を返却する機能](#物品を返却する機能)
  - [機能詳細](#機能詳細)
  - [シーケンス図](#シーケンス図)

## 機能詳細

Slack から返却メッセージを送信し，物品を返却する．

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
    ユーザー ->> Slack: 返却メッセージを送信
    Slack ->> SlackApp: リクエスト送信
    SlackApp ->> SlackApp: request_idを生成
    SlackApp -->> Slack: "返却リクエストを受け付けました．"

    %% 2. リクエスト受け取り
    SlackApp ->> Controller: 返却リクエストを渡す
    Controller ->> DB: 同じrequest_idが存在するか確認
    alt 既に存在
        Controller ->> SlackApp: "このリクエストは既に処理されています．"
        Controller ->> Admin: "返却リクエストが重複して送信されました．"
    end

    %% 3. 返却処理を実行
    Controller ->> DB: 返却対象の物品IDを取得
    alt 物品が存在しない
        Controller ->> DB: equipment_history: request_typeをreturn，response_statusをrejected，error_codeをRULE_NOT_FOUND，changed_byをrequest_user_idとして記録
        Controller ->> SlackApp: "物品が存在しないため，返却ができません．"
        Controller ->> Admin: "物品が存在しないため，返却処理が失敗しました．"
    else 物品が存在する
        %% Controller ->> DB: BEGIN TRANSACTION
        Controller ->> DB: 物品情報をロック付きで取得
        %% DB -->> Controller: 物品情報
        alt status != 'borrowed'
            Controller ->> DB: equipment_history: request_typeをreturn，response_statusをrejected，error_codeをRULE_NOT_BORROWED，changed_byをrequest_user_idとして記録
            Controller ->> SlackApp: "{category}{category_index}返却: 現在未使用なので，返却できません．"
            Controller ->> Admin: "未使用の物品に対する返却リクエストのため，返却処理が失敗しました．"
        else status == 'borrowed' AND user_id != request_user_id AND request_user_is_not_admin
            Controller ->> DB: equipment_history: request_typeをreturn，response_statusをrejected，error_codeをRULE_NOT_OWNER，changed_byをrequest_user_idとして記録
            Controller ->> SlackApp: "{category}{category_index}返却: 使用者本人が返却してください．"
            Controller ->> Admin: "他ユーザーが借りている物品に対する返却リクエストのため，返却処理が失敗しました．"
        else status == 'borrowed' AND user_id == request_user_id OR request_user_is_admin
            Controller ->> DB: equipment: statusを'available', user_idをNULLに更新
            Controller ->> DB: equipment_history: request_typeをreturn，response_statusをsuccess，error_codeをNONE，changed_byをrequest_user_idとして記録
            Controller ->> SlackApp: "{category}{category_index}返却: {slack_name} -> 【未使用】"
            Controller ->> Admin: "返却処理が完了しました．"
        %% Controller ->> DB: COMMIT
        end
    end

```
