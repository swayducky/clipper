    /*const clipAsNewNote = result.clipAsNewNote
    const vault = result.vault
    const noteName = result.noteName
    const note = encodeURIComponent(result.note)
    
    // const baseURL = 'http://localhost:8080'; // Used for testing...
    const baseURL = 'https://jplattel.github.io/obsidian-clipper'
    
    let redirectUrl;
    // Redirect to page (which opens obsidian).
    if (clipAsNewNote) {
        redirectUrl = `${baseURL}/clip-to-new.html?vault=${encodeURIComponent(vault)}&note=${encodeURIComponent(noteName)}&content=${encodeURIComponent(note)}`
    } else {
        redirectUrl = `${baseURL}/clip.html?vault=${encodeURIComponent(vault)}&note=${encodeURIComponent(noteName)}&content=${encodeURIComponent(note)}`
    }
    
    // Open a new tab for clipping through the protocol, since we cannot go from the extension to this..
    if (result.testing) {
        chrome.tabs.create({ url: redirectUrl , active: true},function(obsidianTab){
            // Since we're testing, we are not closing the tag...
        });
    } else {
        chrome.tabs.create({ url: redirectUrl , active: true},function(obsidianTab){
            setTimeout(function() { chrome.tabs.remove(obsidianTab.id) }, 500);
        });
    }*/


/*



document.getElementById("scrapeBtn").addEventListener("click", function() {
    chrome.tabs.executeScript({
        code: '(' + scrapeData + ')();' // Invoking scrapeData function on the current tab
    }, (results) => {
        let csvContent = "data:text/csv;charset=utf-8," + results[0].join("\n");
        let encodedUri = encodeURI(csvContent);
        let link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "scraped_data.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
});*/

function scrapeData() {
    // For this example, we're just scraping all text from the page.
    // Modify this function to suit your needs.
    let textArray = Array.from(document.body.innerText.split("\n"));
    return textArray;
}


function onClip() {
    let title = document.title.replace(/\//g, '')
    let url = window.location.href
    let domain = window.location.hostname
    if (domain.startsWith('www.')) {
        domain = domain.slice(4)
    }
    let defaultNoteFormat = `
- [ ] [{domain}]({url}) {title}. =={clip}`
    // let defaultNoteFormat = `## {date}) [{title}]({url}) > {clip}`
    let defaultClippingOptions = {
        obsidianVaultName: '_map',
        selectAsMarkdown: false,
        obsidianNoteFormat: defaultNoteFormat,
        obsidianNoteName: "_do/Clips",
        clipAsNewNote: true,
        dateFormat: "YYYY-MM-DD",
        datetimeFormat: "YYYY-MM-DD HH:mm:ss",
        timeFormat: "HH:mm:ss",
    }

    async function getFromStorage(key) {
        return new Promise((resolve, reject) => {
            chrome.storage.sync.get(key, resolve);
        })
    }

    let clippingOptions = defaultClippingOptions // await getFromStorage(defaultClippingOptions)

    let note = clippingOptions.obsidianNoteFormat
    
    let date = moment().format(clippingOptions.dateFormat)
    let datetime = moment().format(clippingOptions.datetimeFormat)
    let time = moment().format(clippingOptions.timeFormat)
    let day = moment().format("DD")
    let month = moment().format("MM")
    let year = moment().format("YYYY")
    let zettel = moment().format("YYYYMMDDHHmmss")
    
    let selection = '';
    let link = '';
    let fullLink = '';
    
    // If we're testing..
    if (testing) {
        selection = "This is a test clipping from the Obsidian Clipper"
    } else if (clippingOptions.selectAsMarkdown) {
        // Get the HTML selected
        let sel = rangy.getSelection().toHtml();

        // Turndown to markdown
        let turndown = new TurndownService()

        // This rule constructs url to be absolute URLs for links & images
        let turndownWithAbsoluteURLs = turndown.addRule('baseUrl', {
            filter: ['a', 'img'],
            replacement: function (content, el, options) {
                if (el.nodeName === 'IMG') {
                    link =  el.getAttributeNode('src').value;
                    fullLink = new URL(link, url)
                    return `![${content}](${fullLink.href})`
                } else if (el.nodeName === 'A') {
                    link =  el.getAttributeNode('href').value;
                    fullLink = new URL(link, url)
                    return `[${content}](${fullLink.href})`
                }
            }
        })

        selection = turndownWithAbsoluteURLs.turndown(sel)
        // Otherwise plaintext
    } else {
        selection = window.getSelection()
    }
    if (selection) {
        // remove linebreaks and format nicely, removing any leading spaces in front of lines, for example
        selection = selection.toString().replace(/\n/g, ' ').replace(/\s\s+/g, ' ').trim()
    }

    // Replace the placeholders: (with regex so multiples are replaced as well..)
    note = note.replace(/{clip}/g, selection)
    note = note.replace(/{date}/g, date)
    note = note.replace(/{datetime}/g, datetime)
    note = note.replace(/{time}/g, time)
    note = note.replace(/{day}/g, day)
    note = note.replace(/{month}/g, month)
    note = note.replace(/{year}/g, year)
    note = note.replace(/{url}/g, url)
    note = note.replace(/{title}/g, title)
    note = note.replace(/{zettel}/g, zettel)
    note = note.replace(/{domain}/g, domain)

    // Clip the og:image if it exists
    if (document.querySelector('meta[property="og:image"]')) {
        let image = document.querySelector('meta[property="og:image"]').content
        note = note.replace(/{og:image}/g, `![](${image})`) // image only works in the content of the note
    } else {
        note = note.replace(/{og:image}/g, "")
    }

    // replace the placeholder in the title, taking into account invalid note names and removing special 
    // chars like \/:#^\[\]|?  that result in no note being created... * " \ / < > : | ?
    let noteName = clippingOptions.obsidianNoteName
    noteName = noteName.replace(/{date}/g, date.replace(/[\/":#^\[\]|?<>]/g, ''))
    noteName = noteName.replace(/{day}/g, day.replace(/[\/":#^\[\]|?<>]/g, ''))
    noteName = noteName.replace(/{month}/g, month.replace(/[\/":#^\[\]|?<>]/g, ''))
    noteName = noteName.replace(/{year}/g, year.replace(/[\/":#^\[\]|?<>]/g, ''))
    noteName = noteName.replace(/{url}/g, url.replace(/[\/":#^\[\]|?<>]/g, ''))
    noteName = noteName.replace(/{title}/g, title.replace(/[\/":#^\[\]|?<>]/g, ''))
    noteName = noteName.replace(/{zettel}/g, zettel.replace(/[\/":#^\[\]|?<>]/g, ''))
    noteName = noteName.replace(/{datetime}/g, datetime.replace(/[\/":#^\[\]|?<>]/g, ''))
    noteName = noteName.replace(/{time}/g, time.replace(/[\/":#^\[\]|?<>]/g, ''))
    
    // Send a clipping messsage
    let data = {
        'testing': testing,
        'noteName': noteName,
        'note': note,
        'vault': clippingOptions.obsidianVaultName,
        'new': clippingOptions.clipAsNewNote
    }
    console.log("sending data...", data)
    // chrome.runtime.sendMessage(data)


    alert("Opening Obsidian...")
    //let url = `obsidian://new?vault=_map&title=${encodeURIComponent(title)}`;
    // Open the Obsidian app using the URL scheme
    chrome.tabs.create({ url: `obsidian://new?vault=_map&title=${encodeURIComponent(title)}` });
}

document.addEventListener('DOMContentLoaded', function() {
    let hiLink = document.getElementById('hi')
    hiLink.addEventListener('click', function() {
        let vault = '_map'
        let file = 'YOOOOOO'
        let content = 'hi there'
        let url = `obsidian://new?vault=${vault}&file=${file}&content=${content}`

        // chrome.tabs.create({ url: url }); // not clickable without extra hop
                
        /* Not clickable without extra hop:
        let link = document.createElement("a");
        link.href = url
        link.text = "Open Obsidian"
        document.body.appendChild(link);
        //*/
    });

    document.getElementById("clip").addEventListener("click", onClip);
});
