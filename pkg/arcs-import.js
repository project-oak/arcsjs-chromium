const locale = globalThis.config?.localArcsjs ? 'local': 'cdn';
const path = `./env/arcs-${locale}.js`;
export const {
  logFactory, utils, pathForKind, Params,
  Runtime, Services, Paths, Surfaces, Decorator,
  Chef,
  FirebasePersistor, LocalStoragePersistor, awaitLoginChange,
  RecipeService
} = await import(path);
