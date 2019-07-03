module.exports = async ({ config }) => {
  delete config.module.rules[0].include
  return config
}
