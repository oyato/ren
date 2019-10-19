/**
 * Package ren is the public interface of, and configuration for, the the oyato cloud prerenderer https://oya.to/o-ren.
 *
 * Pre-rendering begins after the DOMContentLoaded event is fired and all callbacks have been called.
 * If page rendering depends on AJAX requests, is asynchronous, or is otherwise not guaranteed
 * to complete during this event, you can call $oren.wait() to ask the renderer to wait.
 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
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
    function $oren(opts) {
        if (!$oren.ok() || !$oren.$) {
            return opts;
        }
        $oren.options = $oren.$.mergeOpts($oren, {
            prev: $oren.options,
            next: opts,
        });
        return $oren.options;
    }
    exports.$oren = $oren;
    /**
     * $oren.options is the options passed to the renderer.
     *
     * Users should prefer calling the $oren() function instead of using this directly.
     */
    $oren.options = {};
    /**
    /* $oren.ok returns true if the renderer is online and not disabled.
    */
    $oren.ok = function ok() {
        return $oren.online() && !$oren.options.disabled;
    };
    /**
     * $oren.online returns true if the renderer is available i.e. the page will be.
     *
     * - It can be used to detect if we're running in the Oyato Cloud.
     */
    $oren.online = function online() {
        return !!$oren.$;
    };
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
    $oren.wait = function wait(p) {
        if (p === void 0) { p = { timeoutMs: 5000 }; }
        return $oren.ok() && $oren.$
            ? $oren.$.wait($oren, p)
            : {
                data: '',
                props: {},
                resolve: function () { },
            };
    };
    /**
     * $oren.onion returns the OnionAddr for the current page, is available.
     */
    $oren.onion = function onion() {
        return $oren.$ && $oren.$.onion($oren);
    };
    // internal implementation detail.
    $oren.$api = '1.1';
    $oren.$ = window['oy@o/o-ren'];
    window.$oren = $oren;
});
