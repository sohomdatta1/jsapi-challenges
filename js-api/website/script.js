window.addEventListener('load', async () => {

    function NOTREACHED() {
        // destroy currently availiable data
        // Challenge Author (sohom): 
        // if you are hitting this codepath repeatedly
        // please use a incognito window, your ad-blocker
        // or other extensions might be sending spurious postMessages
        // to this page
        window.location.href = `https://www.youtube.com/watch?v=FtutLA63Cp8`
    }

    function escapeHtml(unsafe) {
        return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
    }



    class NotesManager {
        constructor() {
            this.noteData = window.localStorage.getItem( 'note' ) || '';
            this.noteTextArea = document.querySelector( '#note-text-area' );
            this.noteTextArea.value = this.noteData;
            this.previewNode = document.querySelector( '#output' );
            this.highlightNode = document.querySelector( '#note-search-highlights' )
            this.noteManager = this;
        }

        static getCurrentNoteManager() {
            if ( !this.noteManager ) {
                this.noteManager = new NotesManager();
            }
            return this.noteManager;
        }

        getNotesTextAreaValue() {
            return this.noteTextArea.value
        }
    
        get() {
            return this.noteData.toString();
        }
    
        set(text) {
            if ( typeof text !== 'string' ) return;
            const cleanedText = DOMPurify.sanitize(text);
            this.noteData = cleanedText;
            window.localStorage.setItem( 'note', cleanedText.toString() ); 
        }
    
        /**
         * Previews text, if text is null will preview existing note
         * @param {String} [text] String to preview
         */
        preview(text) {
            if ( typeof text !== 'string' && !!text ) return;
            if ( !text ) text = this.noteData;
            else text = DOMPurify.sanitize( text );
            this.previewNode.innerHTML = text;
        }
    
        /**
         * Search for the particular text
         * @param {String} text text to search for
         */
        search(text) {
            if ( typeof text !== 'string' ) return;
            if ( !window.enable_experimental_features ) return;
            // TODO(sohom): Address concerns raised by our internal security
            // team regarding this API at b/1337. Given that this API
            // is effectively a no-op and is not current exposed anywhere
            // as of version 0.0.1 it should be fine for now.
            // Since our internal bug tracker is well, "internal"
            // I have dumped relevant portion of the b/1337 at
            // https://github.com/sohomdatta1/jsapi-issues/issues/1
            text = DOMPurify.sanitize( text );
            const doesMatch = this.noteData.includes(text);
            if ( doesMatch ) {
                var lastIndex = 0, i = 0;
                for(var i = this.noteData.substring(i).indexOf(text); i < this.noteData.length; i = i + text.length + this.noteData.substring(i + text.length).indexOf(text)) {
                    if ( lastIndex > i ) break;
                    this.highlightNode.innerHTML += escapeHtml( this.noteData.substring(lastIndex,i) );
                    this.highlightNode.innerHTML += `<mark>${escapeHtml( text ) }</mark>`
                    lastIndex = i + text.length;
                }
                document.querySelector( '#note-text-highlight-wrapper' ).classList.remove( 'hidden' );
            }
        }
    }

    // initialize the document
    NotesManager.getCurrentNoteManager();
    NotesManager.getCurrentNoteManager().preview();

    window.document.querySelector( '#note-submit' ).addEventListener( 'click', (e) => {
        e.preventDefault();
        const nm = NotesManager.getCurrentNoteManager();

        nm.set( nm.getNotesTextAreaValue() );
        nm.preview();
    } );

    window.document.querySelector( '#note-save' ).addEventListener( 'click', (e) => {
        e.preventDefault();
        const nm = NotesManager.getCurrentNoteManager();

        nm.set( nm.getNotesTextAreaValue() );
    } );

    window.document.querySelector( '#note-render' ).addEventListener( 'click', (e) => {
        e.preventDefault();
        const nm = NotesManager.getCurrentNoteManager();

        nm.preview( nm.getNotesTextAreaValue() );
    } );

    /**
     * @experimental Added in 0.0.2
     */
    window.addEventListener( 'message', (e) => {
        if ( !e.origin.endsWith('jsapi.tech') ) return;
        const data = e.data;
        if ( typeof data !== 'object' && typeof data.op !== 'string' && typeof data.payload !== 'string' ) return;
        if ( data.op === 'preview' ) {
            NotesManager.getCurrentNoteManager().preview( data.payload );
        } else if ( data.op === 'set' ) {
            NotesManager.getCurrentNoteManager().set( data.payload );
        } else if ( data.op === 'search' ) {
            NotesManager.getCurrentNoteManager().search( data.payload );
        } else {
            NOTREACHED();
        }
    } );

});
