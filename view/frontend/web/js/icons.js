define([
    "uiClass"
], function (Class) {
    const icons = {
        image     : 'fa-file-image',
        pdf       : 'fa-file-pdf',
        word      : 'fa-file-word',
        powerpoint: 'fa-file-powerpoint',
        excel     : 'fa-file-excel',
        csv       : 'fa-file-csv',
        audio     : 'fa-file-audio',
        video     : 'fa-file-video',
        archive   : 'fa-file-archive',
        code      : 'fa-file-code',
        text      : 'fa-file-alt',
        file      : 'fa-file'
    };
    return Class.extend({
        icons                  : icons,
        mimeTypes              : {
            'image/gif'                                                                : icons.image,
            'image/jpeg'                                                               : icons.image,
            'image/png'                                                                : icons.image,
            'application/pdf'                                                          : icons.pdf,
            'application/msword'                                                       : icons.word,
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'  : icons.word,
            'application/mspowerpoint'                                                 : icons.powerpoint,
            'application/vnd.openxmlformats-officedocument.presentationml.presentation': icons.powerpoint,
            'application/msexcel'                                                      : icons.excel,
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'        : icons.excel,
            'text/csv'                                                                 : icons.csv,
            'audio/aac'                                                                : icons.audio,
            'audio/wav'                                                                : icons.audio,
            'audio/mpeg'                                                               : icons.audio,
            'audio/mp4'                                                                : icons.audio,
            'audio/ogg'                                                                : icons.audio,
            'video/x-msvideo'                                                          : icons.video,
            'video/mpeg'                                                               : icons.video,
            'video/mp4'                                                                : icons.video,
            'video/ogg'                                                                : icons.video,
            'video/quicktime'                                                          : icons.video,
            'video/webm'                                                               : icons.video,
            'application/gzip'                                                         : icons.archive,
            'application/zip'                                                          : icons.archive,
            'text/css'                                                                 : icons.code,
            'text/html'                                                                : icons.code,
            'text/javascript'                                                          : icons.code,
            'application/javascript'                                                   : icons.code,
            'text/plain'                                                               : icons.text,
            'text/richtext'                                                            : icons.text,
            'text/rtf'                                                                 : icons.text
        },
        extensions             : {
            gif : icons.image,
            jpeg: icons.image,
            jpg : icons.image,
            png : icons.image,
            pdf : icons.pdf,
            doc : icons.word,
            docx: icons.word,
            ppt : icons.powerpoint,
            pptx: icons.powerpoint,
            xls : icons.excel,
            xlsx: icons.excel,
            csv : icons.csv,
            aac : icons.audio,
            mp3 : icons.audio,
            ogg : icons.audio,
            avi : icons.video,
            flv : icons.video,
            mkv : icons.video,
            mp4 : icons.video,
            gz  : icons.archive,
            zip : icons.archive,
            css : icons.code,
            html: icons.code,
            js  : icons.code,
            txt : icons.text
        },
        forExtension           : function (extension) {
            return this.extensions[extension.toLowerCase()] || icons.file
        },
        getExtensionForFilename: function (filename) {
            return this.filename.slice((this.filename.lastIndexOf('.') - 1 >>> 0) + 2)
        },
        forFilename            : function (filename) {
            return this.forExtension(this.getExtensionForFilename(filename))
        },
        forMimeType            : function (mimeType) {
            return this.mimeTypes[mimeType.toLowerCase()] || icons.file
        },
    })();
});
