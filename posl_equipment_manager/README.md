# プロジェクト概要

## 開発ドキュメント

- [ER 図・DB 設計書](../docs/er_diagram.md)
- [アーキテクチャ仕様書](../docs/architecture_document.md)
- [貸出シーケンス](../docs/sequence_diagram_borrow.md)
- [返却シーケンス](../docs/sequence_diagram_return.md)
- [登録シーケンス](../docs/sequence_diagram_regist.md)
- [情報更新シーケンス](../docs/sequence_diagram_update.md)
- [廃棄シーケンス](../docs/sequence_diagram_despose.md)

## 前提条件

以下をインストールしていること．

- Node.js (LTS 推奨)
- Docker Desktop (Docker Compose v2 を含む)

## ディレクトリ構成

Next.js のアプリ本体は `app/` 配下に配置する．
`app`以下の構成は，[アーキテクチャ仕様書](../docs/architecture_document.md)のディレクトリ構成を参照．

```
posl_equipment_manager/
```

## 環境構築

### ローカルサーバーの起動

Next.js: http://localhost:3000
PostgreSQL: localhost:5432
Prisma Studio: http://localhost:5555

**1. リポジトリのクローン & 環境変数ファイルの作成**

Slack のトークンなどについては，知っている人に聞くこと．

```zsh
  git clone git@github.com:posl/posl-equipment-manager.git
  cd posl_equipment_manager
  cp .env.example .env
```

**2. Docker コンテナのビルド**

```zsh
  make build
```

**3. Docker コンテナの起動**

```zsh
  make up
```

**4. Prisma のマイグレーションとシードの実行**

初回起動時は，以下のコマンドでマイグレーションと Prisma Client の生成を行う．
`make migrate`は新しいマイグレーションを作成するため，初回以外は内容を確認してから実行する．
`make generate`は，スキーマ定義などを変更した際に都度実行する．

```zsh
  make migrate
  make generate
```

**5. テストデータの投入**

必要に応じて，以下のコマンドでテストデータを投入する．
テストデータは，自由に更新して良い．

```zsh
  make seed
```

**6. Prisma Studio の起動**

データベースの内容をブラウザで確認したい場合は，以下のコマンドで Prisma Studio を起動する．
アプリ起動と別プロセスのため，必要なときだけ実行する．

```zsh
  make studio
```

### テストの実行（未整備）

現時点ではテストは未整備のため，`make test`は成功メッセージのみ出力する．

```zsh
  make test
```

### ローカルサーバーの停止

```zsh
  make down
```

### 開発環境（コンテナ，データベース，ボリューム）の削除

```zsh
  make clean
```
