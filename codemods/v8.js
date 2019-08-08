/**
 * This renames the standalone helper components:
 * - <Initial> to <IfInitial>
 * - <Pending> to <IfPending>
 * - <Fulfilled> to <IfFulfilled>
 * - <Rejected> to <IfRejected>
 * - <Settled> to <IfSettled>
 */

const helperNames = ["Initial", "Pending", "Fulfilled", "Rejected", "Settled"]

module.exports = function transform({ path, source }, api) {
  if (path.includes("/node_modules/")) return

  const j = api.jscodeshift
  const root = j(source)

  // Rename imports
  root
    .find(j.ImportDeclaration, { source: { value: "react-async" } })
    .find(j.ImportSpecifier)
    .filter(node => helperNames.includes(node.value.imported.name))
    .forEach(node => (node.value.imported.name = `If${node.value.imported.name}`))

  // Rename JSX elements
  root
    .find(j.JSXIdentifier)
    .filter(node => helperNames.includes(node.value.name))
    .filter(node => node.parentPath.value.type !== "JSXMemberExpression")
    .forEach(node => (node.value.name = `If${node.value.name}`))

  return root.toSource()
}
