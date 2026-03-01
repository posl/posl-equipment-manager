# アーキテクチャ仕様書

## 概要

本プロジェクトは，クリーンアーキテクチャに基づいて設計されている．

![アーキテクチャ図](../assets/architecture_diagram.png)

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
│   ├── entities/                            # エンティティ
│   │   ├── equipment.ts                     # 物品エンティティ
│   │   │   └── Equipment
│   │   ├── user.ts                          # ユーザーエンティティ
│   │   │   └── User
│   │   ├── budget.ts                        # 予算エンティティ
│   │   │   └── Budget
│   │   ├── category.ts                      # カテゴリエンティティ
│   │   │   └── EquipmentCategory
│   │   ├── history.ts                       # 物品履歴エンティティ
│   │   │   └── EquipmentHistory
│   │   └── index.ts                         # エンティティのエクスポート
│   │
│   ├── enums/                               # 列挙型定義
│   │   ├── equipment-status.ts              # 物品ステータス
│   │   │   └── EquipmentStatus
│   │   ├── request-type.ts                  # リクエストタイプ
│   │   │   └── RequestType
│   │   └── index.ts                         # 列挙型のエクスポート
│   │
│   └── repositories/                        # リポジトリインターフェース
│       ├── equipment-repository.ts          # 物品リポジトリ
│       │   └── IEquipmentRepository
│       ├── user-repository.ts               # ユーザーリポジトリ
│       │   └── IUserRepository
│       ├── equipment-history-repository.ts  # 物品履歴リポジトリ
│       │   └── IEquipmentHistoryRepository
│       ├── budget-repository.ts             # 予算リポジトリ
│       │   └── IBudgetRepository
│       ├── category-repository.ts           # カテゴリリポジトリ
│       │   └── ICategoryRepository
│       └── index.ts                         # リポジトリのエクスポート
│
├── usecases/                                # ユースケース層（アプリケーションロジック）
│   ├── lend-equipment.ts                    # 物品貸出ユースケース
│   │   └── LendEquipmentUseCase
│   ├── return-equipment.ts                  # 物品返却ユースケース
│   │   └── ReturnEquipmentUseCase
│   ├── register-equipment.ts                # 物品登録ユースケース
│   │   └── RegisterEquipmentUseCase
│   ├── update-equipment.ts                  # 物品情報更新ユースケース
│   │   └── UpdateEquipmentUseCase
│   ├── dispose-equipment.ts                 # 物品廃棄ユースケース（実装は早急ではない）
│   │   └── DisposeEquipmentUseCase
│   └── index.ts                             # ユースケースのエクスポート
│
├── interfaces/                              # インターフェース層（外部とのやり取り）
│   └── slack/                               # Slack連携インターフェース
│       ├── handler.ts                       # Slackイベントハンドラー
│       ├── commands/                        # Slackコマンド処理
│       │   ├── lend-command.ts              # /lend コマンド
│       │   ├── return-command.ts            # /return コマンド
│       │   ├── register-command.ts          # /register コマンド
│       │   ├── update-command.ts            # /update コマンド
│       │   └── index.ts                     # コマンドのエクスポート
│       ├── workflows/                       # Slack Workflow Builder対応
│       │   ├── lend-workflow.ts             # 貸出ワークフローステップ
│       │   ├── return-workflow.ts           # 返却ワークフローステップ
│       │   ├── register-workflow.ts         # 登録ワークフローステップ
│       │   ├── update-workflow.ts           # 更新ワークフローステップ
│       │   └── index.ts                     # ワークフローのエクスポート
│       ├── messages/                        # Slackメッセージ整形
│       │   ├── formatter.ts                 # メッセージフォーマッター
│       │   ├── blocks.ts                    # Block Kit構築
│       │   └── index.ts                     # メッセージ関連のエクスポート
│       └── index.ts                         # Slack関連のエクスポート
│
├── infrastructure/                          # インフラ層（外部システム実装）
│   ├── db/                                  # データベース実装
│   │   ├── prisma/                          # Prisma関連ファイル
│   │   │   ├── schema.prisma                # Prismaスキーマ定義（テーブル・リレーション定義）
│   │   │   ├── migrations/                  # Prisma Migrateで自動生成されるマイグレーション
│   │   │   │   └── migration_lock.toml      # マイグレーションロック
│   │   │   └── seed.ts                      # 初期データ投入スクリプト
│   │   ├── client.ts                        # Prisma Client インスタンス管理
│   │   ├── repositories/                    # リポジトリの実装
│   │   │   ├── prisma-equipment-repository.ts
│   │   │   ├── prisma-user-repository.ts
│   │   │   ├── prisma-history-repository.ts
│   │   │   ├── prisma-budget-repository.ts
│   │   │   ├── prisma-category-repository.ts
│   │   │   └── index.ts                     # リポジトリ実装のエクスポート
│   │   └── index.ts                         # DB関連のエクスポート
│   │
│   ├── queue/                               # 非同期処理キュー
│   │   ├── worker.ts                        # バックグラウンドワーカー
│   │   ├── tasks.ts                         # タスク定義
│   │   └── index.ts                         # キュー関連のエクスポート
│   │
│   └── index.ts                             # インフラ層のエクスポート
│
├── config/                                  # 設定ファイル
│   ├── settings.ts                          # アプリケーション設定
│   ├── logging.ts                           # ロギング設定
│   └── index.ts                             # 設定のエクスポート
│
├── tests/                                   # テストコード
│   ├── domain/                              # ドメイン層テスト
│   │   ├── equipment.test.ts
│   │   ├── user.test.ts
│   │   └── enums.test.ts
│   ├── usecases/                            # ユースケース層テスト
│   │   ├── lend-equipment.test.ts
│   │   ├── return-equipment.test.ts
│   │   ├── register-equipment.test.ts
│   │   └── update-equipment.test.ts
│   ├── infrastructure/                      # インフラ層テスト
│   │   └── prisma-repository.test.ts
│   └── fixtures/                            # テストフィクスチャ
│       └── sample-data.ts
│
├── types/                                   # 型定義ファイル
│   ├── common.ts                            # 共通型定義
│   └── index.ts                             # 型のエクスポート
│
├── index.ts                                 # アプリケーションエントリーポイント
├── package.json                             # プロジェクト設定・依存関係
└── tsconfig.json                            # TypeScript設定
```

## 各レイヤーの責務

### 1. Domain 層（ドメイン層）

- **責務**: ビジネスロジックとエンティティの定義，データ永続化のリポジトリインタフェース
- **特徴**: 他のレイヤーに依存しない，最も内側のレイヤー
- **含まれるもの**:
  - エンティティクラス（Equipment, User, Budget, Category, History）
  - ENUM 列挙型（EquipmentStatus, RequestType）
  - ドメインルール
  - リポジトリインターフェース（I〜Repository）: ドメインが必要とするデータ永続化の処理を抽象化するための構造
  - TypeScript の型定義とインターフェース

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
  - データベースアクセス（Prisma を使った PostgreSQL リポジトリ実装）
  - Prisma スキーマ定義とマイグレーション管理
  - 非同期処理ワーカー

## 開発担当

- 未定

## 依存関係のルール

```
┌─────────────────────────────────────┐
│       interfaces (Slack, API)       │  ← 外部インターフェース
└─────────────────┬───────────────────┘
                  │ 依存
┌─────────────────▼───────────────────┐
│              usecases               │  ← アプリケーションロジック
└─────────────────┬───────────────────┘
                  │ 依存
┌─────────────────▼───────────────────┐
│               domain                │  ← ビジネスロジック（最内層）
└─────────────────────────────────────┘
                  ▲
                  │ 実装（依存性逆転）
┌─────────────────┴───────────────────┐
│           infrastructure            │  ← 外部システム実装
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
  - **Usecase ⇄ Infrastructure**: Usecase は domain/repositories のリポジトリインタフェースにのみ依存し，具体的な DB アクセスの実装には依存しない。例えば，PostgreSQL (Prisma) を MySQL に差し替えても，domain のリポジトリインタフェースを変えず infrastructure の実装を差し替えるだけですみ， Usecase は変更の影響を受けない．
  - **Interfaces ⇄ Usecase**: Slack ハンドラーは Usecase のメソッドを呼ぶだけで，内部実装を知らない。Slack を LINE や Web API に差し替えても Usecase は変更の影響を受けない．
  - **Domain ⇄ 外部**: Domain は他のどの層にも依存せず，純粋なビジネスルールのみを持つ。外部技術（DB, Slack 等）の変更の影響を受けない。
- **テスト容易性**: リポジトリインタフェースがあるため，インメモリ実装やモックを注入するだけで Usecase を単独テスト可能。

## 処理フロー

### 例 1: Slack Workflow Builder で貸出を受け付ける場合

1. **入力**: Slack Workflow がトリガーされ，ワークフローステップイベントが発火（interfaces/slack/workflows/lend-workflow.ts）．
2. **ハンドリング**: Workflow ステップハンドラーがフォーム入力を受け取り，パラメータ（equipment_id, user_id 等）を抽出。
3. **ユースケース実行**: `LendEquipmentUseCase.execute(equipment_id, user_id)` を呼び出し（Slash コマンドと同じユースケースを再利用）。
4. **インフラ呼び出し**: 同様に domain のリポジトリインタフェースを介して DB アクセス。
5. **レスポンス整形**: ユースケースの結果をワークフロー用の形式に変換（次のステップへ渡す、または完了通知）。
6. **出力**: ワークフローの次のステップに結果を渡す，または完了を通知．

**ポイント**:

- 外部 I/O は interfaces に隔離され，ユースケースは純粋な処理に専念する．
- DB などの具体実装は infrastructure が担い，ユースケースはリポジトリインタフェースにのみ依存する．
- Slash コマンドと Workflow で同じユースケースを再利用でき，ビジネスロジックの重複を避けられる．
