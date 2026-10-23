# pisa3d-showcase

Vue 3 + TypeScript + Three.js で作った、3D モデルと点群の衝突判定デモです。

GLB 形式の 3D モデル（`public/target.glb`）を読み込み、その周囲に 10×10×10 個の小さな球を格子状に並べます。
モデルを回転させると、モデルを囲む OBB（Oriented Bounding Box）の内側に入った球が赤く、外側の球が青く表示されます。
ボタンで立方体を追加することもでき、立方体もモデルと同じように回転・衝突判定の対象になります。

## 画面の内容

- 床（黄褐色の平面）とグリッド
- GLB モデル（メッシュの輪郭線を緑で表示）
- モデルを囲むバウンディングボックス（緑のワイヤフレーム）
- 「立方体を追加」で追加したランダムな大きさ・位置・色の立方体（それぞれ緑のバウンディングボックス付き）
- 1000 個の小さな球（OBB の内側なら赤、外側なら青）
- 平行光源による影

マウスのドラッグで視点の回転、ホイールで拡大・縮小ができます（OrbitControls）。

## ツールバー

画面左上のスイッチとボタンで表示を切り替えます。

| 操作 | 内容 |
|---|---|
| ワイヤフレーム表示 | バウンディングボックスをワイヤフレームで描くか、塗りつぶすかを切り替える |
| CameraHelper 表示 | 平行光源の影を計算する範囲を表示する |
| X軸で回転 / Y軸で回転 / Z軸で回転 | モデルと追加した立方体を各軸まわりに回転させ続ける（同時に複数オン可） |
| ローテーションリセット | モデルと追加した立方体の回転を初期状態に戻す |
| 立方体を追加 | ランダムな大きさ・位置・色の立方体を 1 つ追加する |
| 追加した立方体を削除（n） | 追加した立方体をすべて削除する（n は追加済みの数） |

## 衝突判定の仕組み

`src/ExtendedGroup.ts` の `ExtendedGroup` クラスが中心です。

1. 読み込んだモデルから AABB（軸に沿った外接箱）を計算し、ワイヤフレームの箱としてグループに追加する
2. その箱から OBB を作り、グループと一緒に回転するようにする
3. 毎フレーム、回転後の OBB に各球の中心が含まれるかを判定し、球の色を変える

追加した立方体も `src/createCube.ts` で同じ `ExtendedGroup` に入れて作るため、モデルと立方体のどれか 1 つの OBB にでも含まれる球が赤くなります。

判定はモデルの形状そのものではなく外接箱で行うため、モデルの穴の部分にある球も赤くなります。

GLB の読み込みに失敗した場合は、コンソールにエラーを出し、モデル以外のシーン（床・グリッド・球）だけを表示します。

## ディレクトリ構成

```
public/target.glb                      表示する 3D モデル
src/main.ts                            エントリポイント（Bootstrap の CSS を読み込み、Vue アプリを起動）
src/App.vue                            PisaTowerComponent を表示するだけのルートコンポーネント
src/components/PisaTowerComponent.vue  3D シーンの構築・アニメーション・衝突判定・ツールバー
src/ExtendedGroup.ts                   AABB・OBB を自動で作る THREE.Group の拡張クラス
src/ExtendedGroup.test.ts              ExtendedGroup のテスト（Vitest）
src/createCube.ts                      追加用の立方体を ExtendedGroup に入れて作る関数
src/createCube.test.ts                 createCube のテスト（Vitest）
index.html                             Vite のエントリ HTML（src/main.ts を読み込む）
vite.config.ts                         Vite の設定（base: './'）
.github/workflows/ci.yml               CI（Lint・型チェック・テスト・ビルド）と GitHub Pages への公開
.github/dependabot.yml                 Dependabot による依存パッケージの更新設定
```

## セットアップ

パッケージマネージャーには Yarn 4 を使います（ロックファイルは `yarn.lock` のみ）。

```
yarn install
```

Yarn 本体は `.yarn/releases/` に同梱しており、`.yarnrc.yml` の `yarnPath` で指定しています。
そのため、グローバルに入っている yarn が 1.x でも、このディレクトリでは自動的に Yarn 4 が使われます（corepack は不要です）。

Plug'n'Play ではなく `node_modules` を使う設定（`nodeLinker: node-modules`）にしています。

## 開発サーバーの起動

```
yarn serve
```

起動後、ターミナルに表示される URL（通常は http://localhost:5173/ ）をブラウザで開きます。

## 本番ビルド

```
yarn build
```

`dist/` に出力されます（Git の管理対象外です）。
アセットは相対パスで参照するため、GitHub Pages のサブパス（`/pisa3d-showcase/`）でもそのまま動きます。

ビルド結果をローカルで確認するには、次を実行します（通常は http://localhost:4173/ ）。

```
yarn preview
```

## 型チェック・Lint

```
yarn type-check
yarn lint
```

`yarn type-check` は vue-tsc で `.vue` ファイルを含めて型を検査したあと、TypeScript 7 の `tsc` で `.ts` ファイルを検査します（Vite はビルド時に型検査を行いません）。

TypeScript 7.0 には他のツールから使う API がないため、TypeScript は 6 と 7 を両方入れています。

- `typescript`：TypeScript 6 の API（`@typescript/typescript6` の別名）。typescript-eslint と vue-tsc が使う
- `@typescript/native`：TypeScript 7（`typescript@7` の別名）。`tsc` コマンドはこちらを使う

typescript-eslint と vue-tsc が TypeScript 7 の API に対応したら、6 は外せます。
`yarn lint` はファイルを書き換えません。自動修正するときは `yarn lint --fix` を実行します。

## テスト

```
yarn test
```

Vitest で `src/**/*.test.ts` を実行します。
描画（WebGL）は対象外で、`ExtendedGroup` の AABB の作成と、回転・移動させたときの OBB の内外判定、`createCube` で作った立方体の AABB・OBB を確認しています。

## CI と公開

GitHub Actions（`.github/workflows/ci.yml`）で、PR と `main` への push のたびに Lint・型チェック・テスト・ビルドを実行します。

`main` への push では、すべて成功したときだけビルド結果を GitHub Pages に公開します。
公開先: https://nagata-minoru.github.io/pisa3d-showcase/

ビルド結果はリポジトリにコミットしません。

依存パッケージ（npm）と GitHub Actions の更新は、Dependabot（`.github/dependabot.yml`）が週 1 回 PR にまとめて作ります。
公開から 14 日たっていない版は対象にしません。

## 使用技術

- Vue 3
- TypeScript 7（Lint と vue-tsc は TypeScript 6 の API を使用）
- Three.js（GLTFLoader, OrbitControls, OBB）
- Bootstrap 5
- Vite
- Vitest
- GitHub Actions / GitHub Pages
