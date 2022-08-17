const path = '../env/arcsjs/';
const [$core, $lib] = [`${path}/core`, `${path}/Library`];

export const {

  App,
  Paths, logFactory

} = (await Promise.all([

  import(`${$core}/utils.min.js`),
  import(`${$lib}/App/Worker/App.js`),
  import(`${$lib}/App/surface-imports.js`),
  //import(`${$lib}/TensorFlow/TensorFlowService.js`)
])).reduce((e, m) =>({...e, ...m}),{});
