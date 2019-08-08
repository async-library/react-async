/**
 * This renames:
 * - <Async.Pending> to <Async.Initial>
 * - <Async.Loading> to <Async.Pending>
 * - <Async.Resolved> to <Async.Fulfilled>
 *
 * This includes any custom instances created with createInstance().
 */

module.exports = function transform({ path, source }, api) {
  if (path.includes("/node_modules/")) return

  const j = api.jscodeshift
  const root = j(source)

  const renameJsxMembers = parentName => {
    root
      .find(j.JSXMemberExpression, { object: { name: parentName }, property: { name: "Pending" } })
      .forEach(node => (node.value.property.name = "Initial"))
    root
      .find(j.JSXMemberExpression, { object: { name: parentName }, property: { name: "Loading" } })
      .forEach(node => (node.value.property.name = "Pending"))
    root
      .find(j.JSXMemberExpression, { object: { name: parentName }, property: { name: "Resolved" } })
      .forEach(node => (node.value.property.name = "Fulfilled"))
  }

  // Rename instances using default import
  root
    .find(j.ImportDeclaration, { source: { value: "react-async" } })
    .find(j.ImportDefaultSpecifier)
    .forEach(node => renameJsxMembers(node.value.local.name))

  // Rename instances using named `Async` import
  root
    .find(j.ImportDeclaration, { source: { value: "react-async" } })
    .find(j.ImportSpecifier, { imported: { name: "Async" } })
    .forEach(node => renameJsxMembers(node.value.local.name))

  // Rename instances created with `createInstance`
  root
    .find(j.ImportDeclaration, { source: { value: "react-async" } })
    .find(j.ImportSpecifier, { imported: { name: "createInstance" } })
    .forEach(node => {
      const createInstance = node.value.local.name
      root
        .find(j.VariableDeclarator)
        .filter(node => node.value.init.type === "CallExpression")
        .filter(node => node.value.init.callee.name === createInstance)
        .forEach(node => renameJsxMembers(node.value.id.name))
    })

  return root.toSource()
}
