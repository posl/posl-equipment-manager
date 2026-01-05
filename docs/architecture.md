# クリーンアーキテクチャ構成

## 概要

本プロジェクトは，クリーンアーキテクチャに基づいて設計されている．

## アーキテクチャレイヤー

```
外部インターフェース層 (interfaces)
         ↓
   ユースケース層 (usecases)
         ↓
     ドメイン層 (domain)
         ↑
     インフラ層 (infrastructure)
```

## ディレクトリ構成（仮構成のため，変更の可能性あり）

```
app/
├── domain/                         # ドメイン層（エンティティ・ビジネスルール）
│   ├── __init__.py
│   ├── equipment.py                # 物品エンティティ
│   │   └── Equipment              # - equipment_id, category, name, type, etc.
│   ├── user.py                     # ユーザーエンティティ
│   │   └── User                   # - user_id, slack_user_id, slack_name, real_name
│   ├── budget.py                   # 予算エンティティ
│   │   └── Budget                 # - budget_id, name
│   ├── category.py                 # カテゴリエンティティ
│   │   └── EquipmentCategory      # - code, name
│   ├── history.py                  # 物品履歴エンティティ
│   │   └── EquipmentHistory       # - history_id, equipment_id, event_type, etc.
│   ├── enums.py                    # 列挙型定義
│   │   ├── EquipmentStatus        # - available, borrowed, broken, disposed
│   │   └── EventType              # - assign, lend, change, return, break, dispose
│   │
│   └── repositories/               # リポジトリインターフェース（抽象）
│       ├── __init__.py
│       ├── equipment_repo.py       # 物品リポジトリ抽象
│       │   └── EquipmentRepository
│       ├── user_repo.py            # ユーザーリポジトリ抽象
│       │   └── UserRepository
│       ├── history_repo.py         # 履歴リポジトリ抽象
│       │   └── HistoryRepository
│       ├── budget_repo.py          # 予算リポジトリ抽象
│       │   └── BudgetRepository
│       └── category_repo.py        # カテゴリリポジトリ抽象
│           └── CategoryRepository
│
├── usecases/                       # ユースケース層（アプリケーションロジック）
│   ├── __init__.py
│   ├── lend_equipment.py           # 物品貸出ユースケース
│   │   └── LendEquipmentUseCase
│   ├── return_equipment.py         # 物品返却ユースケース
│   │   └── ReturnEquipmentUseCase
│   ├── regist_equipment.py         # 物品登録ユースケース
│   │   └── RegisterEquipmentUseCase
│   ├── update_equipment.py         # 物品情報更新ユースケース
│   │   └── UpdateEquipmentUseCase
│   ├── dispose_equipment.py        # 物品廃棄ユースケース（実装は早急ではない）
│   │   └── DisposeEquipmentUseCase
│
├── interfaces/                     # インターフェース層（外部とのやり取り）
│   ├── __init__.py
│   ├── slack/                      # Slack連携インターフェース
│   │   ├── __init__.py
│   │   ├── handler.py              # Slackイベントハンドラー
│   │   ├── commands/               # Slackコマンド処理
│   │   │   ├── __init__.py
│   │   │   ├── lend_command.py     # /lend コマンド
│   │   │   ├── return_command.py   # /return コマンド
│   │   │   ├── regist_command.py   # /regist コマンド
│   │   │   └── update_command.py   # /update コマンド
│   │   ├── workflows/              # Slack Workflow Builder対応
│   │   │   ├── __init__.py
│   │   │   ├── lend_workflow.py    # 貸出ワークフローステップ
│   │   │   ├── return_workflow.py  # 返却ワークフローステップ
│   │   │   ├── regist_workflow.py  # 登録ワークフローステップ
│   │   │   └── update_workflow.py  # 更新ワークフローステップ
│   │   └── messages/               # Slackメッセージ整形
│   │       ├── __init__.py
│   │       ├── formatter.py        # メッセージフォーマッター
│   │       └── blocks.py           # Block Kit構築
│
├── infrastructure/                 # インフラ層（外部システム実装）
│   ├── __init__.py
│   ├── db/                         # データベース実装
│   │   ├── __init__.py
│   │   ├── connection.py           # DB接続管理
│   │   ├── sqlite_repo.py          # SQLiteリポジトリ実装
│   │   │   ├── SqliteEquipmentRepository
│   │   │   ├── SqliteUserRepository
│   │   │   ├── SqliteHistoryRepository
│   │   │   ├── SqliteBudgetRepository
│   │   │   └── SqliteCategoryRepository
│   │   ├── migrations/             # マイグレーション
│   │   │   ├── create_tables.sql   # テーブル作成SQL
│   │   │   └── seed_data.sql       # 初期データ投入SQL
│   │   └── models.py               # ORMモデル（必要に応じて）
│   │
│   ├── sheet/                      # スプレッドシート連携
│   │   ├── __init__.py
│   │   ├── sheet_gateway.py        # Googleスプレッドシート連携
│   │   └── config.py               # スプレッドシート設定
│   │
│   └── queue/                      # 非同期処理キュー
│       ├── __init__.py
│       ├── worker.py               # バックグラウンドワーカー
│       └── tasks.py                # タスク定義
│
├── config/                         # 設定ファイル
│   ├── __init__.py
│   ├── settings.py                 # アプリケーション設定
│   └── logging.py                  # ロギング設定
│
├── tests/                          # テストコード
│   ├── __init__.py
│   ├── domain/                     # ドメイン層テスト
│   │   ├── test_equipment.py
│   │   ├── test_user.py
│   │   └── test_enums.py
│   ├── usecases/                   # ユースケース層テスト
│   │   ├── test_lend_equipment.py
│   │   ├── test_return_equipment.py
│   │   └── test_regist_equipment.py
│   │   └── test_update_equipment.py
│   ├── infrastructure/             # インフラ層テスト
│   │   ├── test_sqlite_repo.py
│   │   └── test_sheet_gateway.py
│   └── fixtures/                   # テストフィクスチャ
│       └── sample_data.py
│
├── main.py                         # アプリケーションエントリーポイント
└── pyproject.toml                  # プロジェクト設定・依存関係
```

## 各レイヤーの責務

### 1. Domain 層（ドメイン層）

- **責務**: ビジネスロジックとエンティティの定義，データ永続化の抽象
- **特徴**: 他のレイヤーに依存しない，最も内側のレイヤー
- **含まれるもの**:
  - エンティティクラス（Equipment, User, Budget, Category, History）
  - 列挙型（EquipmentStatus, EventType）
  - ドメインルール
  - リポジトリインターフェース（抽象）：ドメインが必要とするデータ永続化の契約を定義

### 2. Usecases 層（ユースケース層）

- **責務**: アプリケーション固有のビジネスルールを実装
- **特徴**: ドメイン層のエンティティとリポジトリ抽象に依存（内側同士の依存）
- **含まれるもの**:
  - 物品貸出ロジック（LendEquipmentUseCase）
  - 物品返却ロジック（ReturnEquipmentUseCase）
  - 物品登録ロジック（RegisterEquipmentUseCase）
  - その他の業務フロー

### 3. Interfaces 層（インターフェース層）

- **責務**: 外部とのやり取りを制御
- **特徴**: Slack，API など外部インターフェースの実装
- **含まれるもの**:
  - Slack ハンドラー
  - Slash コマンド処理（/lend, /return など）
  - Workflow Builder ステップ処理
  - メッセージ整形

### 4. Infrastructure 層（インフラ層）

- **責務**: 外部システムとの具体的な連携実装
- **特徴**: リポジトリインターフェースの具体実装
- **含まれるもの**:
  - データベースアクセス（SQLite リポジトリ実装）
  - スプレッドシート連携
  - 非同期処理ワーカー

## 開発担当

- 未定

## 依存関係のルール

```
┌─────────────────────────────────────┐
│     interfaces (Slack, API)         │  ← 外部インターフェース
└─────────────────┬───────────────────┘
                  │ 依存
┌─────────────────▼───────────────────┐
│         usecases                    │  ← アプリケーションロジック
└─────────────────┬───────────────────┘
                  │ 依存
┌─────────────────▼───────────────────┐
│          domain                     │  ← ビジネスロジック（最内層）
└─────────────────────────────────────┘
                  ▲
                  │ 実装（依存性逆転）
┌─────────────────┴───────────────────┐
│      infrastructure                 │  ← 外部システム実装
└─────────────────────────────────────┘
```

**重要な原則**:

- 内側のレイヤーは外側のレイヤーを知らない
- 依存性逆転の原則により，infrastructure は domain で定義されたリポジトリ抽象を実装
- domain レイヤーは他のどのレイヤーにも依存しない（抽象を自分で定義し，外側が実装する）

### 依存性逆転のポイント

**依存の向きと抽象の役割**:

- Usecase（高レベル）は domain/repositories の抽象にのみ依存し，具体的な DB/外部サービス実装を知らない．
- Infrastructure（低レベル）が domain の抽象を実装し，起動時に DI（依存性注入）で Usecase に渡される．
- 従来の「内（ビジネスロジック）→ 外（データアクセス実装）」という依存を反転させ，「Usecase → Domain（抽象）← Infrastructure（実装）」となる．

**メリット**:

- **交換容易性**: SQLite を MySQL/Cloud SQL に差し替えても，domain の抽象を変えず実装を差し替えるだけで Usecase は無変更．
- **テスト容易性**: 抽象があるため，インメモリ実装やモックを注入するだけで Usecase を単独テスト可能．

## 処理フロー

<!-- ### 例1: Slashコマンドで貸出を受け付ける場合

1. **入力**: Slack から `/lend` コマンドが呼ばれる（interfaces/slack/commands/lend_command.py）．
2. **ハンドリング**: Slack ハンドラーがリクエストを受け取り，コマンド引数（equipment_id, user_id等）をパース（interfaces/slack/handler.py）。
3. **ユースケース実行**: `LendEquipmentUseCase.execute(equipment_id, user_id)` が実行され，domain/repositories で定義された抽象リポジトリ越しにデータ取得・更新を行う。
4. **インフラ呼び出し**: domain の抽象を実装した `SqliteEquipmentRepository` など（infrastructure/db/sqlite_repo.py）が実際の DB にアクセスし，結果を返す。
5. **レスポンス整形**: ユースケースの結果（Equipment エンティティや成功フラグ）を Slack メッセージ用のフォーマットに変換（interfaces/slack/messages/formatter.py）。
6. **出力**: Slack に応答を返す． -->

### 例 1: Slack Workflow Builder で貸出を受け付ける場合

1. **入力**: Slack Workflow がトリガーされ，ワークフローステップイベントが発火（interfaces/slack/workflows/lend_workflow.py）．
2. **ハンドリング**: Workflow ステップハンドラーがフォーム入力を受け取り，パラメータ（equipment_id, user_id等）を抽出。
3. **ユースケース実行**: `LendEquipmentUseCase.execute(equipment_id, user_id)` を呼び出し（Slashコマンドと同じユースケースを再利用）。
4. **インフラ呼び出し**: 同様に domain の抽象を介して DB アクセス。
5. **レスポンス整形**: ユースケースの結果をワークフロー用の形式に変換（次のステップへ渡す、または完了通知）。
6. **出力**: ワークフローの次のステップに結果を渡す，または完了を通知．

**ポイント**:

- 外部 I/O は interfaces に隔離され，ユースケースは純粋な処理に専念する．
- DB などの具体実装は infrastructure が担い，ユースケースは抽象にのみ依存する．
- Slash コマンドと Workflow で同じユースケースを再利用でき，ビジネスロジックの重複を避けられる．
