# アーキテクチャ仕様書

## 概要

本プロジェクトは，クリーンアーキテクチャに基づいて設計されている．
![アーキテクチャ図](./architecture_diagram.pdf)

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
├── domain/                                  # ドメイン層（エンティティ・ビジネスルール）
│   ├── __init__.py
│   ├── equipment.py                         # 物品エンティティ
│   │   └── Equipment
│   ├── user.py                              # ユーザーエンティティ
│   │   └── User
│   ├── budget.py                            # 予算エンティティ
│   │   └── Budget
│   ├── category.py                          # カテゴリエンティティ
│   │   └── EquipmentCategory
│   ├── history.py                           # 物品履歴エンティティ
│   │   └── EquipmentHistory
│   ├── enums.py                             # 列挙型定義
│   │   ├── EquipmentStatus
│   │   └── RequestType
│   │
│   └── repositories/                        # リポジトリインターフェース
│       ├── __init__.py
│       ├── equipment_repository.py          # 物品リポジトリ
│       │   └── EquipmentRepository
│       ├── user_repository.py               # ユーザーリポジトリ
│       │   └── UserRepository
│       ├── equipment_history_repository.py  # 物品履歴リポジトリ
│       │   └── EquipmentHistoryRepository
│       ├── budget_repository.py             # 予算リポジトリ
│       │   └── BudgetRepository
│       └── category_repository.py           # カテゴリリポジトリ
│           └── CategoryRepository
│
├── usecases/                                # ユースケース層（アプリケーションロジック）
│   ├── __init__.py
│   ├── lend_equipment.py                    # 物品貸出ユースケース
│   │   └── LendEquipmentUseCase
│   ├── return_equipment.py                  # 物品返却ユースケース
│   │   └── ReturnEquipmentUseCase
│   ├── regist_equipment.py                  # 物品登録ユースケース
│   │   └── RegisterEquipmentUseCase
│   ├── update_equipment.py                  # 物品情報更新ユースケース
│   │   └── UpdateEquipmentUseCase
│   ├── dispose_equipment.py                 # 物品廃棄ユースケース（実装は早急ではない）
│   │   └── DisposeEquipmentUseCase
│
├── interfaces/                              # インターフェース層（外部とのやり取り）
│   ├── __init__.py
│   ├── slack/                               # Slack連携インターフェース
│   │   ├── __init__.py
│   │   ├── handler.py                       # Slackイベントハンドラー
│   │   ├── commands/                        # Slackコマンド処理
│   │   │   ├── __init__.p
│   │   │   ├── lend_command.py              # /lend コマンド
│   │   │   ├── return_command.py            # /return コマンド
│   │   │   ├── regist_command.py            # /regist コマンド
│   │   │   └── update_command.py            # /update コマンド
│   │   ├── workflows/                       # Slack Workflow Builder対応
│   │   │   ├── __init__.p
│   │   │   ├── lend_workflow.py             # 貸出ワークフローステップ
│   │   │   ├── return_workflow.py           # 返却ワークフローステップ
│   │   │   ├── regist_workflow.py           # 登録ワークフローステップ
│   │   │   └── update_workflow.py           # 更新ワークフローステップ
│   │   └── messages/                        # Slackメッセージ整形
│   │       ├── __init__.p
│   │       ├── formatter.py                 # メッセージフォーマッター
│   │       └── blocks.py                    # Block Kit構築

├── infrastructure/                          # インフラ層（外部システム実装）
│   ├── __init__.py
│   ├── db/                                  # データベース実装
│   │   ├── __init__.py
│   │   ├── connection.py                    # DB接続管理
│   │   ├── sqlite_repository/               # SQLiteリポジトリの外部実装
│   │   │   ├── SqliteEquipmentRepository.py
│   │   │   ├── SqliteUserRepository.py
│   │   │   ├── SqliteHistoryRepository.py
│   │   │   ├── SqliteBudgetRepository.py
│   │   │   └── SqliteCategoryRepository.py
│   │   ├── migrations/                      # マイグレーション
│   │   │   ├── create_tables.sql            # テーブル作成SQL
│   │   │   └── seed_data.sql                # 初期データ投入SQL
│   │   └── models.py                        # ORMモデル（必要に応じて）
│   │
│   ├── sheet/                               # スプレッドシート連携
│   │   ├── __init__.py
│   │   ├── sheet_gateway.py                 # Googleスプレッドシート連携
│   │   └── config.py                        # スプレッドシート設定
│   │
│   └── queue/                               # 非同期処理キュー
│       ├── __init__.py
│       ├── worker.py                        # バックグラウンドワーカー
│       └── tasks.py                         # タスク定義
│
├── config/                                  # 設定ファイル
│   ├── __init__.py
│   ├── settings.py                          # アプリケーション設定
│   └── logging.py                           # ロギング設定
│
├── tests/                                   # テストコード
│   ├── __init__.py
│   ├── domain/                              # ドメイン層テスト
│   │   ├── test_equipment.py
│   │   ├── test_user.py
│   │   └── test_enums.py
│   ├── usecases/                            # ユースケース層テスト
│   │   ├── test_lend_equipment.py
│   │   ├── test_return_equipment.py
│   │   └── test_regist_equipment.py
│   │   └── test_update_equipment.py
│   ├── infrastructure/                      # インフラ層テスト
│   │   ├── test_sqlite_repository.py
│   │   └── test_sheet_gateway.py
│   └── fixtures/                            # テストフィクスチャ
│       └── sample_data.py
│
├── main.py                                  # アプリケーションエントリーポイント
└── pyproject.toml                           # プロジェクト設定・依存関係
```

## 各レイヤーの責務

### 1. Domain 層（ドメイン層）

- **責務**: ビジネスロジックとエンティティの定義，データ永続化のリポジトリインタフェース
- **特徴**: 他のレイヤーに依存しない，最も内側のレイヤー
- **含まれるもの**:
  - エンティティクラス（Equipment, User, Budget, Category, History）
  - ENUM 列挙型（EquipmentStatus, EventType）
  - ドメインルール
  - リポジトリインターフェース: ドメインが必要とするデータ永続化の処理を抽象化するための構造

### 2. Usecases 層（ユースケース層）

- **責務**: アプリケーション固有のビジネスルールを実装
- **特徴**: ドメイン層のエンティティとリポジトリインタフェースに依存
- **含まれるもの**:
  - 物品貸出ロジック（LendEquipmentUseCase）
  - 物品返却ロジック（ReturnEquipmentUseCase）
  - 物品登録ロジック（RegisterEquipmentUseCase）
  - 物品情報更新ロジック（UpdateEquipmentUseCase）
  - その他の業務フロー

### 3. Interfaces 層（インターフェース層）

- **責務**: 外部とのやり取りを制御
- **特徴**: Slack，API など外部インターフェースの実装
- **含まれるもの**:
  - Slack ハンドラー
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
- 依存性逆転の原則により，infrastructure は domain で定義されたリポジトリインタフェースを実装
- domain レイヤーは他のどのレイヤーにも依存しない

### 依存性逆転

**依存の向きとリポジトリインタフェースの役割**:

- Usecase（高レベル）は domain/repositories のリポジトリインタフェースにのみ依存し，具体的な DB アクセスの外部実装には依存しない．
- Infrastructure（低レベル）がリポジトリインタフェースの具体的な DB アクセスを実装し，起動時に依存性注入で Usecase に渡される．
- 従来の「内（ビジネスロジック）→ 外（データアクセス実装）」という依存を反転させ，「Usecase → Domain（リポジトリインタフェース）← Infrastructure（実装）」となる．

**メリット**:

- **疎結合の実現**: 各層が他の層に依存せず独立しており，モジュール間の依存を最小限に抑えられる．内部実装の変更やテストが容易となり，保守性が高まる．
  - **Usecase ⇄ Infrastructure**: Usecase は domain/repositories のリポジトリインタフェースにのみ依存し，具体的な DB アクセスの実装には依存しない。例えば，SQLite を MySQL に差し替えても，domain のリポジトリインタフェースを変えず infrastructure の実装を差し替えるだけですみ， Usecase は変更の影響を受けない．
  - **Interfaces ⇄ Usecase**: Slack ハンドラーは Usecase のメソッドを呼ぶだけで，内部実装を知らない。Slack を LINE や Web API に差し替えても Usecase は変更の影響を受けない．
  - **Domain ⇄ 外部**: Domain は他のどの層にも依存せず，純粋なビジネスルールのみを持つ。外部技術（DB, Slack 等）の変更の影響を受けない。
- **テスト容易性**: リポジトリインタフェースがあるため，インメモリ実装やモックを注入するだけで Usecase を単独テスト可能。

## 処理フロー

### 例 1: Slack Workflow Builder で貸出を受け付ける場合

1. **入力**: Slack Workflow がトリガーされ，ワークフローステップイベントが発火（interfaces/slack/workflows/lend_workflow.py）．
2. **ハンドリング**: Workflow ステップハンドラーがフォーム入力を受け取り，パラメータ（equipment_id, user_id 等）を抽出。
3. **ユースケース実行**: `LendEquipmentUseCase.execute(equipment_id, user_id)` を呼び出し（Slash コマンドと同じユースケースを再利用）。
4. **インフラ呼び出し**: 同様に domain のリポジトリインタフェースを介して DB アクセス。
5. **レスポンス整形**: ユースケースの結果をワークフロー用の形式に変換（次のステップへ渡す、または完了通知）。
6. **出力**: ワークフローの次のステップに結果を渡す，または完了を通知．

**ポイント**:

- 外部 I/O は interfaces に隔離され，ユースケースは純粋な処理に専念する．
- DB などの具体実装は infrastructure が担い，ユースケースはリポジトリインタフェースにのみ依存する．
- Slash コマンドと Workflow で同じユースケースを再利用でき，ビジネスロジックの重複を避けられる．
