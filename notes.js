
// Käyttämiseen tarvitsee NODE.js laajennuskirjaston ja json -palvelimen auki portille 3000.
// json-server --watch notes.json --port 3000 

const url = "http://localhost:3000/notes";  // JSON-palvelimen osoite.
const noteDate = new Date().toISOString().slice(0, 10);  // tallentaa ensimmäiset 10 merkkiä date() functiosta muuttujaksi.



// Tarkistaa vastauksen fetch apille (vastaus palvelimelta) kun käytetään PUT ja DELETE komentoja.
let haeresponse = response => {
    if (!response.ok) {
        if (response.status === 404) {
            throw new Error('404 palvelinta ei löydy.');
            }
        throw new Error(`Verkkoon ei saatu yhteyttä: ${response.status} ${response.statusText}`);
    }
    return response.json();
}


// Tarkistaa vastauksen fetch komennoille. Hakee muistiinpanot JSON palvelimelta.
const getNotes = async () => {
    try {
        const response = await fetch(url);
        const data = await haeresponse(response);
        return data;

    } catch (error) {
        console.error(error);
        return [];
    }
}


// Uuden muistiinpanon lisääminen POST metodilla.
const form = document.getElementById('lisaaMuistiin');
form.addEventListener('submit', async function(e) {
    e.preventDefault();
    const muistiinpano = document.getElementById('muistiinpano').value;
    const data = {date: noteDate, note: muistiinpano} // Palvelimelle tallennettava data. ID määräytyy automaattisesti.
    
    if (!muistiinpano) {
        console.error('Muistiinpano ei voi olla tyhjä!');
        return;
    }

    try {
        const response = await fetch(url,{
            body: JSON.stringify(data), 
            method: "POST", 
            headers: { "Content-type": "application/json ; charset=UTF-8" }
        })

    if (!response.ok) {
        throw new Error(`Muistiinpanon lisääminen epäonnistui: ${response.status} ${response.statusText}`);
    }

    } catch (error) {
        console.error(error)
        return []
    }

    displayNotes();  // Päivittää muistiinpanolistan. Funktio alempana tiedostossa.
    form.reset();  // Tyhjentää lomakkeen, kun muistiinpano lisätään.
});


// Funktio, joka lähettää muokatun muistiinpanon PUT metodilla palvelimelle.
let editNote = async (url, id, date, note) => {
    let rivi = {"id": id, "date": date, "note": note}
    if (id) url = url + "/" + id
    try {
        const response = await fetch(url, {
            body: JSON.stringify(rivi),
            method: "PUT",
            headers: { "Content-type": "application/json ; charset=UTF-8" }
        });
        const data = await haeresponse(response);
        form.reset();
        document.getElementById('lisaa').value = "Lisää";
        document.querySelector('.muokataan')?.classList.remove('muokataan');
        location.reload();  // Päivittää sivun. displayNotes() funktio lakkaa toimimasta oiken kun muokkaa enemmän kuin yhtä muistiinpanoa session aikana.
        
    } catch (error) {
        console.error(error);
        return [];
    }
}


// Funktio, joka poistaa halutun muistiinpanon DELETE metodilla palvelimelta.
let deleteNote = async (url, id, date, note) => {
    let rivi = {"id": id, "date": date, "note": note}
    if (id) url = url + "/" + id
    try {
        const response = await fetch(url, {
            body: JSON.stringify(rivi),
            method: "DELETE",
            headers: { "Content-type": "application/json ; charset=UTF-8" }
        });
        const data = haeresponse(response);
        form.reset();
        document.getElementById('lisaa').value = "Lisää";
        document.querySelector('.muokataan')?.classList.remove('muokataan');
        displayNotes();
        
    } catch (error) {
        console.error(error);
        return [];
    }
}


// Funktio, joka "resetoi" lomakkeen ja muistiinpanolistan, kun muokkauksen (tai uuden muistiinpanon) peruuttaa.
const peruutaBtn = document.getElementById('peruuta');
peruutaBtn.addEventListener('click', () => {
    document.getElementById('muistiinpano').value = "";
    document.querySelector('.muokataan')?.classList.remove('muokataan');
    document.getElementById('lisaa').style.display = "block";
    document.getElementById('tallenna').style.display = "none";
})



// Luo sivulle listan muistiinpanoista, jotka on haettu JSON palvelimelta. Sisältää (muokkaa/poista) painikkeet jokaiselle muistiinpanolle.
// Lisäksi funktio sisältää toiminnot muokkaamiselle ja poistamiselle, jotka laukaisevat PUT ja DELETE metodit, jotka näit ylempänä.
const displayNotes = async () => {
    const data = await getNotes();
    const noteList = document.getElementById('lista');
    noteList.innerHTML = "";
    data.forEach(item => {
        const listItem = document.createElement('div');
        listItem.classList.add('list-item');
        noteList.appendChild(listItem);

        const listObj = document.createElement('p');
        listObj.classList.add('notes')
        listItem.appendChild(listObj);

        listObj.innerHTML = (item.date + " | " + item.note);

        const controls = document.createElement('div');
        controls.classList.add('controls');
        listItem.appendChild(controls);

        const editIcon = document.createElement('a');
        editIcon.classList.add('control');
        editIcon.addEventListener('click', () => {
            document.getElementById('muistiinpano').value = item.note;
            listObj.classList.add('muokataan');
            document.getElementById('lisaa').style.display = "none";
            document.getElementById('tallenna').style.display = "block";
            document.getElementById('tallenna').addEventListener('click', () => {
                item.note = document.getElementById('muistiinpano').value;
                editNote(url, item.id, item.date, item.note);
            });
        });
        editIcon.innerHTML = '<i class="fa fa-edit"></i>'
        controls.appendChild(editIcon);

        const deleteIcon = document.createElement('a');
        deleteIcon.classList.add('control');
        deleteIcon.addEventListener('click', () => {
            deleteNote(url, item.id, item.date, item.note);
            });
        deleteIcon.innerHTML = '<i class="fa fa-trash"></i>'
        controls.appendChild(deleteIcon);
        
    });
}



// Hakee muistiinpanot palvelimelta sivun lautautuessa ensmimmäisen kerran.
displayNotes();