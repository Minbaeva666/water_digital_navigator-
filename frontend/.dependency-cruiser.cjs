// .dependency-cruiser.cjs (frontend)
const path = require("path");

module.exports = {
  forbidden: [], // we don't enforce rules now; we just want a graph
  options: {
    tsConfig: {
      fileName: "tsconfig.json",
    },
    // Tell depcruise how Vite resolves imports
    enhancedResolveOptions: {
      alias: {
        "@": path.join(process.cwd(), "src"),
        "/src": path.join(process.cwd(), "src"),
      },
      extensions: [".ts", ".tsx", ".js", ".jsx", ".mjs"],
    },
    // optional: collapse nodes by top folders so the graph is readable
    collapse: "^src/(components|pages|layouts|services)/[^/]+",
  },
};
