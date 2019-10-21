/**
 * Package ren is the public interface of, and configuration for, the the oyato cloud prerenderer https://oya.to/o-ren.
 *
 * Pre-rendering begins after the DOMContentLoaded event is fired and all callbacks have been called.
 * If page rendering depends on AJAX requests, is asynchronous, or is otherwise not guaranteed
 * to complete during this event, you can call $oren.wait() to ask the renderer to wait.
 */

/**
 * Options describes the options accepted by the renderer.
 *
 * - Users can control the rendering by calling the exported `$oren({options})` function. `$oren` is also exported as window.$oren.
 */
export interface Options {
  /**
   * autoRedirect, when set to a HTTP status code 301, 302, 303, 307 or 308, enables automatic redirection.
   *
   * - If `window.url` changes after the page is rendered, `status` is set to this value
   *   and the HTTP `location` header is set to the new URL instructing the server to redirect.
   * - This causes client-side redirects to be visible on the server side.
   */
  autoRedirect?: number
  /**
   * disabled prevents rendering — even if the renderer is online.
   *
   * - This can be used to instruct the server to return the original HTML.
   */
  disabled?: boolean
  /**
   * embedRuntimeStyles specifies whether or not to embed the content of runtime styles — à la styled-components — into the HTML source.
   *
   * - This can be used to prevent FOUC, etc.
   */
  embedRuntimeStyles?: boolean
  /**
   * embedStylesheets, if specified instructs the renderer to embed the content of linked
   * stylesheets whose size is less than or equal to embedStylesheet into the page.
   *
   * - This can save an extra HTTP request for small stylesheets.
   * - For security reasons css rules might not be loaded from a different domain.
   */
  embedStylesheets?: number
  /**
   * exports is a map of JSON-stringify-able (global) variables to set when the page loads.
   *
   * - This is can be used to cache API requests.
   * - For reasons of security, the output JSON is escaped in the following way:
   *   - & is replaced with \u0026
   *   - < is replaced with \u003c
   *   - > is replaced with \u003e
   */
  exports?: { [globalVar: string]: any }
  /**
   * httpEquiv specifies whether or not to process <meta http-equiv="cache-control|content-type|expires|pragma|status"> elements.
   *
   * - This is the _standard_ way to set HTTP headers from the client side,
   *   but might be more cumbersome than Options.autoRedirect or Options.status.
   */
  httpEquiv?: boolean
  /**
   * keepInjectedScripts specifies whether or not to keep injected scripts in the rendered HTML.
   *
   * - These are scripts that have been injected at run-time i.e. not in the original HTML.
   *   They might store state, loaded in the wrong order or otherwise break the page.
   */
  keepInjectedScripts?: boolean
  /**
   * localStorage specifies whether or not to embed values stored in `window.localStorage` into the page.
   *
   * - Embedded values are set when the page loads iff they don't already exist in the browser.
   * - This can be used to cache API requests, etc., but is less flexible than `exports`.
   * - @see exports for details on how the output is escaped.
   */
  localStorage?: boolean
  /**
   * preconnect specifies whether or not to connect to external hosts before their resources are referenced.
   *
   * - This can improve loading times when stylesheets, scripts, etc. are loaded from external hosts.
   */
  preconnect?: boolean
  /**
   * removeNodes is a list querySelectorAll selectors or HTMLElement/Nodes to remove from the HTML source.
   *
   * - e.g. ['script'] removes all scripts from the page after rendering resulting in a fully static page.
   */
  removeNodes?: Array<string | Element>
  /**
   * sessionStorage specifies whether or not to embed values stored in `window.sessionStorage` into the page.
   *
   * - Embedded values are set when the page loads iff they don't already exist in the browser.
   * - This can be used to cache API requests, etc., but is less flexible than `exports`.
   * - See `exports` for details on how the output is escaped.
   */
  sessionStorage?: boolean
  /**
   * status, if set, specifies the HTTP status code.
   *
   * - This can be used to e.g. set a 404 status.
   * - @see autoRedirect above.
   * - @see httpEquiv above.
   */
  status?: number
}

/**
 * WaitPromise contains about a promise for the renderer to wait for an element to be rendered.
 * @see $oren.wait().
 */
export interface WaitPromise {
  /**
   * data specifies a value the user can store in the `data-o-ren-wait` attribute of an element that should waited upon.
   */
  data: string
  /**
   * props is the object {'data-o-ren-wait': WaitPromise.data}.
   * It's for convenience, to enable spreading props in React et al.
   * It's an empty object if the renderer is not online.
   */
  props: { 'data-o-ren-wait': string } | {}
  /**
   * resolve can be called to instruct unblock the renderer instead of explicitly rendering an element.
   */
  resolve: () => void
}

/**
 * OnionAddr holds details about the T0R.onion address for the current hostname
 */
export interface OnionAddr {
  /**
   * domain is the T0R.onion address assigned to the hostname of the current page.
   */
  domain: string
  /**
   * hostname is the same as domain, but includes the subdomain iff the request came via a subdomain.
   * e.g. if example.net is assigned T0R.onion, then requests to api.T0R.onion are forwarded
   * to api.example.net and hostname will be api.T0R.onion instead of T0R.onion.
   */
  hostname: string
}

/**
 * $oren merges opts into $oren.options and returns the new options.
 *
 * - Array options are appended to the existing entry in $oren.options.
 * - Boolean options replace the existing entry in $oren.options.
 * - Number options replace the existing entry in $oren.options.
 * - Object options are merged with (overwriting) the existing entry in $oren.options.
 *
 * - If the $oren.ok() returns false, opts is returned as-is and $oren.options is not updated.
 *
 * Users should set options as early as possible:
 * - When the script first runs
 * - or during the DOMContentLoadeded event
 * - or before a WaitPromise is resolved, data rendered, or times out
 */
export function $oren(opts: Partial<Options>): Options {
  if (!$oren.ok() || !$oren.$) {
    return opts
  }
  $oren.options = $oren.$.mergeOpts($oren, {
    prev: $oren.options,
    next: opts,
  })
  return $oren.options
}

/**
 * $oren.options is the options passed to the renderer.
 *
 * Users should prefer calling the $oren() function instead of using this directly.
 */
$oren.options = {} as Options

/**
/* $oren.ok returns true if the renderer is online and not disabled.
*/
$oren.ok = function ok(): boolean {
  return $oren.online() && !$oren.options.disabled
}

/**
 * $oren.online returns true if the renderer is available i.e. the page will be.
 *
 * - It can be used to detect if we're running in the Oyato Cloud.
 */
$oren.online = function online(): boolean {
  return !!$oren.$
}

/**
 * $oren.wait asks the renderer to wait for an element to be rendered.
 *
 * timeoutMs is a _hint_ (in milliseconds) about a good maximum time to wait
 * before rejecting the promise and continuing.
 *
 * - @see WaitPromise.
 * - The caller should either call WaitPromise.resolve()
 *   or render an element with `data-o-ren-wait={WaitPromise.data}` into the DOM.
 *   For convenience, ...spreading WaitPromise.props in the JSX props has the same effect.
 *
 * - If the $oren.ok() returns false, an object with empty data and props and no-op resolve is returned.
 */
$oren.wait = function wait(
  p: { timeoutMs: number } = { timeoutMs: 5000 }
): WaitPromise {
  return $oren.ok() && $oren.$
    ? $oren.$.wait($oren, p)
    : {
        data: '',
        props: {},
        resolve: () => {},
      }
}

/**
 * $oren.onion returns the OnionAddr for the current page, is available.
 */
$oren.onion = function onion(): OnionAddr | undefined {
  return $oren.$ && $oren.$.onion($oren)
}

// internal implementation detail.
$oren.$api = '1.1'
$oren.$ = window['oy@o/o-ren']
declare global {
  interface Window {
    $oren?: typeof $oren
    'oy@o/o-ren'?: {
      mergeOpts: (
        r: typeof $oren,
        p: { prev: Options; next: Partial<Options> }
      ) => Options
      wait: (r: typeof $oren, p: { timeoutMs: number }) => WaitPromise
      onion: (r: typeof $oren) => OnionAddr | undefined
    }
  }
}

window.$oren = $oren
