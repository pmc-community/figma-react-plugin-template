// HEADS UP!!!
// pageInfo is a global


// FUNCTION WRAPPERS
// HEADS UP!!! don't forget to wrap the function after its definition

// refresh pageInfo global, after the function execution
const AFTER = (func) => {
    return function(...args) {
        console.log('executing after');
        const result = func.apply(this, args);

        pageInfo = {
            siteInfo: getObjectFromArray ({permalink: pageInfo.siteInfo.permalink, title: pageInfo.siteInfo.title}, pageList),
            savedInfo: getPageSavedInfo (pageInfo.siteInfo.permalink, pageInfo.siteInfo.title)
        };
        return result;
    };
}

// refresh the pageInfo global, before the function execution
const REFRESH_PAGE_INFO_BEFORE = (func) => {
    return function(...args) {
        return new Promise((resolve) => {

            pageInfo = {
                siteInfo: getObjectFromArray ({permalink: pageInfo.siteInfo.permalink, title: pageInfo.siteInfo.title}, pageList),
                savedInfo: getPageSavedInfo (pageInfo.siteInfo.permalink, pageInfo.siteInfo.title)
            };

            resolve(pageInfo);
        })
        .then((updatedPageInfo) => {
            const pageInfoArgIndex = func.toString().match(/\((.*?)\)/)[1].split(',').findIndex(arg => arg.includes('pageInfo'));
            args.splice(pageInfoArgIndex, 0, updatedPageInfo);
            return func.apply(this, args);
        });
    };
}

// FUNCTIONS
const showPageFullInfoCanvas = (pageInfo) => {
    if (pageInfo) {
        initPageFullInfoCanvasBeforeShow(pageInfo);
        $('#offcanvasPageFullInformation').offcanvas('show');
        initPageFullInfoCanvasAfterShow(pageInfo);
        initPageFullInfoCanvasAfterDocReady(pageInfo);
    }
}

const initPageFullInfoCanvasAfterDocReady = (pageInfo) => {
    REFRESH_PAGE_INFO_BEFORE__fillTagList(pageInfo);
}

const initPageFullInfoCanvasAfterShow = (pageInfo) => {
    // for tags
    setTagEditor('#offcanvasPageFullInfoPageTagsEditor', pageInfo);
}

const initPageFullInfoCanvasBeforeShow = (pageInfo) => {
    $('#offcanvasPageFullInfoPageGeneralCustomNotesEdit').val('');
    // for custom notes
    setPageStatusButtons(pageInfo);
    setCanvasSectionsOpeners();
    resetCustomNotesInputAreas();
    setCanvasButtonsFunctions(pageInfo);
    setInitialCanvasSectionsVisibility();
    fillPageTitle(pageInfo);
    fillPageLastUpdate(pageInfo);
    fillPageExcerpt(pageInfo);
    setCustomNoteTextAreaLimits();
    initCustomNotesTable(pageInfo);
    setCanvasGeneralCustomNotesVisibility(pageInfo);

    // for tags
    setCanvasPageCustomTagsVisibility(pageInfo);
    
}

const fillTagList = (pageInfo) => {
    const $tagItemsContainer = $('div[siteFunction="offcanvasPageFullInfoPageTagsList"]');
    const $tagItemElement = $('a[siteFunction="offcanvasPageFullInfoPageTagButton"]')[0];
    const html = $tagItemElement.outerHTML;
    $tagItemsContainer.empty();

    siteTags = pageInfo.siteInfo.tags || [];
    customTags = pageInfo.savedInfo.customTags || [];

    siteTags.sort().forEach( tag => {
        const $el = $(html);
        $el.text(tag);
        $el.attr('href',`/tag-info?tag=${tag}`);
        $el.removeClass('btn-primarry').removeClass('btn-success').addClass('btn-primary');
        $el.appendTo( $tagItemsContainer);
    });

    customTags.sort().forEach( tag => {
        const $el = $(html);
        $el.text(tag);
        $el.attr('href',`/tag-info?tag=${tag}`);
        $el.removeClass('btn-primarry').removeClass('btn-primary').addClass('btn-success');
        $el.appendTo( $tagItemsContainer);
    });
}

// wrap the function to refresh the pageInfo before the execution
const REFRESH_PAGE_INFO_BEFORE__fillTagList = REFRESH_PAGE_INFO_BEFORE(fillTagList);

const setCanvasGeneralCustomNotesVisibility = (pageInfo) => {
    if ( getPageStatusInSavedItems(pageInfo)) {
        $('div[siteFunction="offcanvasPageFullInfoPageGeneralCustomNotesLimitsAlert"]').show();
        $('div[siteFunction="offcanvasPageFullInfoPageGeneralCustomNotesSavePageAlert"]').hide();
        $('div[siteFunction="offcanvasPageFullInfoPageGeneralCustomNotesContainer"]').show();
    }
    else {
        $('div[siteFunction="offcanvasPageFullInfoPageGeneralCustomNotesLimitsAlert"]').hide();
        $('div[siteFunction="offcanvasPageFullInfoPageGeneralCustomNotesSavePageAlert"]').show();
        $('div[siteFunction="offcanvasPageFullInfoPageGeneralCustomNotesContainer"]').hide();
    }
}

const setCanvasPageCustomTagsVisibility = (pageInfo) => {
    if ( getPageStatusInSavedItems(pageInfo)) {
        $('div[siteFunction="offcanvasPageFullInfoPageCustomTags"]').show();
    }
    else {
        $('div[siteFunction="offcanvasPageFullInfoPageCustomTags"]').hide();
    }
}

const setPageStatusButtons = (pageInfo) => {
    if ( getPageStatusInSavedItems(pageInfo)) {
        $('button[siteFunction="offcanvasPageFullInfoPageSaveToSavedItems"]').addClass('disabled');
        $('button[siteFunction="offcanvasPageFullInfoPageRemoveFromSavedItems"]').removeClass('disabled');
    }
    else {
        $('button[siteFunction="offcanvasPageFullInfoPageSaveToSavedItems"]').removeClass('disabled');
        $('button[siteFunction="offcanvasPageFullInfoPageRemoveFromSavedItems"]').addClass('disabled');
    }
}

const resetCustomNotesInputAreas = () => {
    $('#offcanvasPageFullInfoPageGeneralCustomNotesEdit').val('');
    $('span[siteFunction="offcanvasPageFullInfoPageGeneralCustomNoteWords"]').text('W: 0');
    $('span[siteFunction="offcanvasPageFullInfoPageGeneralCustomNoteChars"]').text('C: 0');
}

const setCustomNoteTextAreaLimits = () => {
    keepTextInputLimits(
        '#offcanvasPageFullInfoPageGeneralCustomNotesEdit', 
        50, 
        250, 
        'span[siteFunction="offcanvasPageFullInfoPageGeneralCustomNoteWords"]', 
        'span[siteFunction="offcanvasPageFullInfoPageGeneralCustomNoteChars"]'
    );
}

const setCanvasButtonsFunctions = (pageInfo) => {

    // .off('click') is mandatory, otherwise the listener will be binded multiple times to the page
    // and the function will be executed for all history of pageInfo until the whole page is reloaded
    $('button[siteFunction="offcanvasPageFullInfoPageGeneralCustomNotesEditAdd"]').off('click').on('click', function() {
        addCustomNote(pageInfo);
    });

    $('button[siteFunction="offcanvasPageFullInfoPageGeneralCustomNotesEditUpdate"]').off('click').on('click', function() {
        const noteId = $('button[siteFunction="offcanvasPageFullInfoPageGeneralCustomNotesEditUpdate"]').attr('selectedNote');
        updateCustomNote(noteId, pageInfo);
    });

    $('button[siteFunction="offcanvasPageFullInfoPageGeneralCustomNotesEditDelete"]').off('click').on('click', function() {
        const noteId = $('button[siteFunction="offcanvasPageFullInfoPageGeneralCustomNotesEditDelete"]').attr('selectedNote');
        deleteCustomNote(noteId, pageInfo);
    });

    $('button[siteFunction="offcanvasPageFullInfoPageSaveToSavedItems"]').off('click').on('click', function() {
        savePageToSavedItems(pageInfo);
        setPageStatusButtons(pageInfo);
        setCanvasGeneralCustomNotesVisibility(pageInfo);
        setCanvasPageCustomTagsVisibility(pageInfo);

        // for custom notes
        refreshNotesTable(pageInfo);

        // for custom tags
        setTagEditor('#offcanvasPageFullInfoPageTagsEditor', pageInfo);
        REFRESH_PAGE_INFO_BEFORE__fillTagList(pageInfo);

        createGlobalLists();
    });
    
    $('button[siteFunction="offcanvasPageFullInfoPageRemoveFromSavedItems"]').off('click').on('click', function() {
        removePageFromSavedItems(pageInfo);
        setPageStatusButtons(pageInfo);
        setCanvasGeneralCustomNotesVisibility(pageInfo);
        setCanvasPageCustomTagsVisibility(pageInfo);

        // for custom notes
        refreshNotesTable(pageInfo);

        // for custom tags
        REFRESH_PAGE_INFO_BEFORE__fillTagList(pageInfo);
        createGlobalLists();
    });
    
}

const refreshNotesTable = (pageInfo) => {
    const notesData = getPageNotes(pageInfo);
    const table = $('#offcanvasPageFullInfoPageGeneralCustomNotesTable').DataTable();
    table.rows().remove().draw();
    table.rows.add(notesData).draw();
}

const addCustomNote = (pageInfo) => {
    note = $('#offcanvasPageFullInfoPageGeneralCustomNotesEdit').val();
    if (addNote(note, pageInfo)) refreshNotesTable(pageInfo);
    resetCustomNotesInputAreas();
    toggleUpdateNoteButton();
    toggleDeleteNoteButton();
    unsetSelectedNote();
}

const updateCustomNote = (noteId, pageInfo) => {
    note = $('#offcanvasPageFullInfoPageGeneralCustomNotesEdit').val();
    if (updateNote(noteId, note, pageInfo)) refreshNotesTable(pageInfo);
    resetCustomNotesInputAreas();
    toggleUpdateNoteButton();
    toggleDeleteNoteButton();
    unsetSelectedNote();
}

const deleteCustomNote = (noteId, pageInfo) => {
    if (deleteNote(noteId, pageInfo)) refreshNotesTable(pageInfo);
    resetCustomNotesInputAreas();
    toggleUpdateNoteButton();
    toggleDeleteNoteButton();
    unsetSelectedNote();
}

const setInitialCanvasSectionsVisibility = () => {
    $('div[siteFunction="offcanvasPageFullInfoPageGeneral"]').hide();
    $('div[siteFunction="offcanvasPageFullInfoPageTags"]').hide();
}

const setCanvasSectionsOpeners = () => {
    $('span[siteFunction="offcanvasPageFullInfoPageOpenGeneral"]').on('click', function() {
        $('div[siteFunction="offcanvasPageFullInfoPageGeneral"]').fadeIn();
    })

    $('span[siteFunction="offcanvasPageFullInfoPageTagsOpen"]').on('click', function() {
        $('div[siteFunction="offcanvasPageFullInfoPageTags"]').fadeIn();
    })
}

const fillPageTitle = (pageInfo) => {
    $('a[siteFunction="offcanvasPageFullInfoPageGeneralDocLink"]').text(pageInfo.siteInfo.title);
    $('a[siteFunction="offcanvasPageFullInfoPageGeneralDocLink"]').attr('href',pageInfo.siteInfo.permalink);
}

const fillPageLastUpdate = (pageInfo) => {
    $('span[siteFunction="offcanvasPageFullInfoPageGeneralLastUpdateDate"]').text(formatDate(pageInfo.siteInfo.lastUpdate));
}

const fillPageExcerpt = (pageInfo) => {
    pageExcerpt = pageInfo.siteInfo.excerpt || '---';
    $('span[siteFunction="offcanvasPageFullInfoPageGeneralExcerptText"]').text(pageExcerpt);
}

const initCustomNotesTable = (pageInfo) => {
    const permalink = pageInfo.siteInfo.permalink.replace(/^\/|\/$/g, '').replace(/\//g, '_').trim();
    const $table = $('#offcanvasPageFullInfoPageGeneralCustomNotesTable').DataTable();
    if ($.fn.DataTable.isDataTable($table)) $table.destroy();
        
    setDataTable(
        '#offcanvasPageFullInfoPageGeneralCustomNotesTable',
        `PageCustomNotes_${permalink}`,
        
        // columns settings
        [
            // date
            {
                data: 'date',
                type: 'date',
                className: 'dt-left alwaysCursorPointer alwaysTextToLeft'
            }, 

            // note
            {
                data: "note",
                className: 'alwaysCursorPointer'
            },

            // note id
            { 
                data: "id",
                searchable: false, 
                orderable: false, 
                visible: false
            }

        ],

        (table) => { postProcessCustomNotesTable(table, pageInfo) },
        (rowData) => {processCustomNotesTabelsClickOnRow(rowData, pageInfo)},
        {
            order: [
                [0, "desc"]
            ],
            data: getPageNotes(pageInfo)
        }
    );
}

const processCustomNotesTabelsClickOnRow = (rowData, pageInfo) => {
    $('#offcanvasPageFullInfoPageGeneralCustomNotesEdit').val(rowData.data.note).on('input', function() { 
        disableDeleteNoteButton(); // disable delete if click on table and start typing in note text area
    });

    $('#offcanvasPageFullInfoPageGeneralCustomNotesEdit').trigger('keyup'); // to update word and char counts
    toggleDeleteNoteButton(true);
    toggleUpdateNoteButton(true);
    setSelectedNote(rowData);
}

const postProcessCustomNotesTable = (table, pageInfo) => {
    if(table) {
        deleteAllNotes = {
            attr: {
                siteFunction: 'tablePageCustomNotesRemoveAllNotes',
                title: `Remove all custom notes for page ${pageInfo.siteInfo.title}`
            },
            className: 'btn-danger btn-sm text-light focus-ring focus-ring-warning mb-2',
            text: 'Delete All Notes',
            action: () => {
                removeAllCustomNotes(pageInfo);
                const notesData = getPageNotes(pageInfo);
                table.clear().rows.add(notesData).draw();
                resetCustomNotesInputAreas();
                toggleUpdateNoteButton();
                toggleDeleteNoteButton();
                unsetSelectedNote();
        
            }
        };
        const btnArray = [];
        btnArray.push(deleteAllNotes);
        addAdditionalButtonsToTable(table, '#offcanvasPageFullInfoPageGeneralCustomNotesTable', 'bottom2', btnArray);      
    }   
}

const toggleDeleteNoteButton = (mode) => {
    if (mode) $('button[siteFunction="offcanvasPageFullInfoPageGeneralCustomNotesEditDelete"]').removeClass('disabled');
    else $('button[siteFunction="offcanvasPageFullInfoPageGeneralCustomNotesEditDelete"]').addClass('disabled');
}

const toggleUpdateNoteButton = (mode) => {
    if (mode) $('button[siteFunction="offcanvasPageFullInfoPageGeneralCustomNotesEditUpdate"]').removeClass('disabled');
    else $('button[siteFunction="offcanvasPageFullInfoPageGeneralCustomNotesEditUpdate"]').addClass('disabled');
}

const setSelectedNote = (rowData) => {
    $('button[siteFunction="offcanvasPageFullInfoPageGeneralCustomNotesEditDelete"]').attr('selectedNote', rowData.data.id);
    $('button[siteFunction="offcanvasPageFullInfoPageGeneralCustomNotesEditUpdate"]').attr('selectedNote', rowData.data.id)
}

const unsetSelectedNote = () => {
    $('button[siteFunction="offcanvasPageFullInfoPageGeneralCustomNotesEditDelete"]').attr('selectedNote', '');
    $('button[siteFunction="offcanvasPageFullInfoPageGeneralCustomNotesEditUpdate"]').attr('selectedNote', '')
}

const disableDeleteNoteButton = () => {
    toggleDeleteNoteButton();
    $('button[siteFunction="offcanvasPageFullInfoPageGeneralCustomNotesEditDelete"]').attr('selectedNote', '');
}

const setTagEditor = (editorSelector, pageInfo) => {
    if ( getPageStatusInSavedItems(pageInfo)) {
        const options = {
            toolbar: {
                show: false,
                selector: '#offcanvasPageFullInfoPageTagsEditorToolbar'
            },
            menuBar: {
                get show() {return options.toolbar.show},
                selector: '#offcanvasPageFullInfoPageTagsEditorMenubar'
            },
            builtInOptions: {}
        };

        setEditor(
            editorSelector, 
            options,
            (editor) => { postProcessTagEditor(editor, editorSelector, pageInfo); }, 
            (editor, callbackResponse) => { postProcessingEditorText(editor, editorSelector, pageInfo, callbackResponse); },
            (editor) => { posProcessEditorTextOnHitEnter(editor, pageInfo); }
        );
    }
}

const postProcessTagEditor = (editor, editorSelector, pageInfo) => {
    // post processing editor after creation, 
    // runs only one time, after the editor is created

    // setting the observer to see when tags are added in the editor (when hit enter key)
    // and apply styles to the tags
    setElementCreateBySelectorObserver (`${editorSelector} p`, () => {
        $(`${editorSelector} p`).each( function() {
            if ($(this).children().length === 0) $(this).addClass('btn bg-success-subtle btn-sm text-dark  m-2');
            else $(this).addClass('addTagLine');
        });
        $(".addTagLine:not(:last)").hide();
    }); 
}

const postProcessingEditorText = (editor, editorSelector, pageInfo, callbackResponse) => {
    const editorText = editor.getData();
    const cleanEditorText = DOMPurify.sanitize(editorText.replace(/<[^>]*>/g, '').replace(/(\n|&nbsp;)/g, ''));    
    if ( cleanEditorText.trim() ==='' || cleanEditorText.trim() ===',') editor.setData(cleanEditorText);

    // setTimeout is necessary to avoid endless loop
    setTimeout(() => { callbackResponse(); }, 10); //job done here, is time to set back the change:data listener 
}

const posProcessEditorTextOnHitEnter = (editor, pageInfo) => {
    let editorText = editor.getData();
    const matches = editorText.match(/<p>&nbsp;<\/p>$/g);
    const count = matches ? matches.length : 0
    if (count > 0) {
        tags = transformEditorTextToArray(editorText);
        if (tags.length > 0 ) {
            editor.setData('');    
            processNewTags(tags, pageInfo);
        }
    }
    else {
        editor.setData(editorText.replace(/^(<p>&nbsp;<\/p>)+/, '').replace(/<p>&nbsp;<\/p>$/g, ''));
        editor.model.change((writer) => { writer.setSelection(writer.createPositionAt(editor.model.document.getRoot(), 'end')); });
    }
};

const processNewTags = (tags, pageInfo) => {
    tags.forEach ( tag => {
        const isPageTag = _.includes(_.map(getPageTags(pageInfo), _.toLower), _.toLower(tag));
        if (!isPageTag) addTagToPage(tag, pageInfo);
    } );
}

const addTagToPage = (tag, pageInfo) => {
    updateGlobalTagLists(tag);
    if (addTag(tag, pageInfo)) {
        pageInfo.savedInfo.customTags = getPageTags(pageInfo);
        REFRESH_PAGE_INFO_BEFORE__fillTagList(pageInfo);
    }
}

const updateGlobalTagLists = (tag) => {
    const isCustomTag = _.includes(_.map(globCustomTags, _.toLower), _.toLower(tag));
    if ( !isCustomTag ) { 
        globCustomTags.push(tag);
        globCustomTags.sort();
        globAllTags.push(tag);
        globAllTags.sort();
    }
}

