// Registers a resolve hook so node --experimental-strip-types can follow
// extension-less relative imports inside .ts files (image-asset-utils.ts
// imports "./menu-extraction-utils" without an extension, as TS requires).
import { register } from "node:module"

register(
  new URL(
    "data:text/javascript," +
      encodeURIComponent(`
        export async function resolve(specifier, context, nextResolve) {
          try {
            return await nextResolve(specifier, context)
          } catch (err) {
            if (specifier.startsWith(".") && !/\\.[a-z]+$/.test(specifier)) {
              return nextResolve(specifier + ".ts", context)
            }
            throw err
          }
        }
      `)
  )
)
