'use strict';
window.addEventListener("load", () => {
  window.a = "*";
  const onmessage = (name) => {
    return window.parent.postMessage(name, window.a);
  };
  const parseUrl = (url) => {
    return (new URL(url)).host.endsWith(".jsapi.tech");
  };
  const el_form_login_form = document.getElementById("note");
  const parsed = document.getElementById("note-text-area");
  const tmp = document.getElementById("output");
  const back = document.getElementById("note-go-back")
  const preview_print = document.getElementById("note-print-preview");
  const printBtn = document.getElementById("note-print");
  const self = new class {
    constructor() {
      this.note = window.localStorage.getItem("note") || null;
    }
    set(str) {
      console.log(`NOTE_APP_SETTER_CALL ${str}`);
      window.localStorage.setItem("note", str);
      var bookmarkName = DOMPurify.sanitize(str, {ADD_TAGS: ['link','style']}); // allow CSS
      tmp.innerHTML = bookmarkName;
      parsed.setAttribute( 'data-last', self.get() );
      this.note = str;
      parsed.value = str;
    }
    get() {
      return console.log("NOTE_APP_GETTER_CALL"), this.note || parsed.getAttribute( 'data-last' ) || window.localStorage.getItem("note");
    }
    goBack() {
      this.set( parsed.getAttribute( 'data-last' ) );
    }
  };
  el_form_login_form.addEventListener("submit", (event) => {
    return event.preventDefault(), event = parsed.value, self.set(event), false;
  });
  back.addEventListener("click", (event) => {
    event.preventDefault();
    self.goBack();
  });
  self.set(self.get());
  window.addEventListener("beforeunload", () => {
    onmessage("NOTE_APP_API_UNLOADED");
  });
  const urlInstance = new URL(window.location.href);
  return ("true" === urlInstance.searchParams.get("enableapi") && parseUrl(urlInstance.searchParams.get("recv")) && window.parent || window.opener) && (onmessage("NOTE_APP_API_LOADED"), window.a = urlInstance.searchParams.get("recv"), window.addEventListener("message", async(event) => {
    var factor_text;
    if (parseUrl(event.origin)) {
      if ("string" == typeof event.data) {
        if (event.data.startsWith("NOTE_APP_FLAG_REQUEST")) {
          onmessage("NOTE_APP_EXPERIMENTAL_API_CALL_MADE");
          factor_text = (await fetch("file:///flag.txt")).text;
          if (!(event.source === window)) {
            onmessage("You need to try a bit harder...");
          }
          onmessage("NOTE_APP_FLAG_REQUEST_RESPONSE " + factor_text);
        } else {
          if (event.data.startsWith("NOTE_APP_SET_REQUEST")) {
            onmessage("NOTE_APP_EXPERIMENTAL_API_CALL_MADE ");
            const [a, ...b] = event.data.split(" ");
            self.set(b.join(' '));
          }
        }
      }
    } else {
      onmessage("NOTE_APP_UNTRUSTED_ORIGIN");
    }
  })), false;
});
