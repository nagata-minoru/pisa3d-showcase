import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import { withVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'

// 旧設定（package.json の eslintConfig）と同じルール構成にしている
export default withVueTs(
  { ignores: ['docs/**'] },
  pluginVue.configs['flat/essential'],
  js.configs.recommended,
  vueTsConfigs.base,
  vueTsConfigs.eslintRecommended,
  {
    rules: {
      'no-debugger': 'off',
    },
  },
)
