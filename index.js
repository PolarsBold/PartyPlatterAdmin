// === Constants ===
const BASE = "https://fsa-crud-2aa9294fe819.herokuapp.com/api";
const COHORT = "/2504-FTB-ET-WEB-FT";
const API = BASE + COHORT;

// === State ===
let parties = [];
let selectedParty;
let rsvps = [];
let guests = [];

/** Updates state with all parties from the API */
async function getParties() {
  try {
    const response = await fetch(API + "/events");
    const result = await response.json();
    parties = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}

/** Updates state with a single party from the API */
async function getParty(id) {
  try {
    const response = await fetch(API + "/events/" + id);
    const result = await response.json();
    selectedParty = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}

/** Updates state with all RSVPs from the API */
async function getRsvps() {
  try {
    const response = await fetch(API + "/rsvps");
    const result = await response.json();
    rsvps = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}

/** Updates state with all guests from the API */
async function getGuests() {
  try {
    const response = await fetch(API + "/guests");
    const result = await response.json();
    guests = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}

function formEvent() {
  const inputForm = document.querySelector("#input-form");
  inputForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    const dateFromForm = document.getElementById("date-input").value;
    const isoDate = new Date(dateFromForm).toISOString();
    const newPartyObject = {
      name: document.getElementById("name-input").value,
      id: Math.floor(Math.random() * 1000),
      description: document.getElementById("description-input").value,
      date: isoDate,
      location: document.getElementById("location-input").value,
    };
    try {
      const response = await fetch(
        "https://fsa-crud-2aa9294fe819.herokuapp.com/api/2504-FTB-ET-WEB-FT/events",
        {
          method: "POST",
          body: JSON.stringify(newPartyObject),
          headers: { "Content-type": "application/json; charset=UTF-8" },
        }
      );
      const json = await response.json();
      console.log(json);
      await getParties();
      render();
      inputForm.reset();
      return json;
    } catch (err) {
      console.error(err);
    }
  });
}

// function deleteParty() {
//   const deleteButton = document.querySelector("#delete-button");
//   deleteButton.addEventListener("click", async function () {
//     try {
//       const response = await fetch(
//         `https://fsa-crud-2aa9294fe819.herokuapp.com/api/2504-FTB-ET-WEB-FT/events/${selectedParty.id}`,
//         { method: "DELETE" }
//       );
//       const $p = document.querySelector("#selected-party-text");
//       const $pTextNode = document.createTextNode(
//         "Please select a party to learn more."
//       );
//       $p.appendChild($pTextNode);
//       $app.querySelector("#party-detail-section").replaceWith($p);
//       await getParties();
//       render();
//     } catch (err) {
//       console.log(err);
//     }
//   });
// }
// === Components ===

/** Party name that shows more details about the party when clicked */
function PartyListItem(party) {
  const $li = document.createElement("li");

  if (party.id === selectedParty?.id) {
    $li.classList.add("selected");
  }

  $li.innerHTML = `
    <a href="#selected">${party.name}</a>
  `;
  $li.addEventListener("click", () => getParty(party.id));
  return $li;
}

/** A list of names of all parties */
function PartyList() {
  const $ul = document.createElement("ul");
  $ul.classList.add("parties");

  const $parties = parties.map(PartyListItem);
  $ul.replaceChildren(...$parties);

  return $ul;
}

/** Detailed information about the selected party */
function SelectedParty() {
  if (!selectedParty) {
    const $p = document.createElement("p");
    $p.id = "selected-party-text";
    $p.textContent = "Please select a party to learn more.";
    return $p;
  }

  const $party = document.createElement("section");
  $party.id = "party-detail-section";
  $party.innerHTML = `
    <h3>${selectedParty.name} #${selectedParty.id}</h3>
    <time datetime="${selectedParty.date}">
      ${selectedParty.date.slice(0, 10)}
    </time>
    <address>${selectedParty.location}</address>
    <p>${selectedParty.description}</p><br>
    <button id="delete-button">Delete Party</button>
    <GuestList></GuestList>
  `;

  const deleteButton = $party.querySelector("#delete-button");
  deleteButton.addEventListener("click", async function () {
    try {
      const response = await fetch(
        `https://fsa-crud-2aa9294fe819.herokuapp.com/api/2504-FTB-ET-WEB-FT/events/${selectedParty.id}`,
        { method: "DELETE" }
      );
      const $p = document.querySelector("#selected-party-text");
      const $pTextNode = document.createTextNode(
        "Please select a party to learn more."
      );
      selectedParty = null;
      await getParties();
      render();
    } catch (err) {
      console.log(err);
    }
  });

  $party.querySelector("GuestList").replaceWith(GuestList());

  return $party;
}

/** List of guests attending the selected party */
function GuestList() {
  const $ul = document.createElement("ul");
  const guestsAtParty = guests.filter((guest) =>
    rsvps.find(
      (rsvp) => rsvp.guestId === guest.id && rsvp.eventId === selectedParty.id
    )
  );

  // Simple components can also be created anonymously:
  const $guests = guestsAtParty.map((guest) => {
    const $guest = document.createElement("li");
    $guest.textContent = guest.name;
    return $guest;
  });
  $ul.replaceChildren(...$guests);

  return $ul;
}

function createInputs() {
  const $inputs = document.createElement("section");
  $inputs.id = "inputs";
  $inputs.innerHTML = `
  <form id="input-form">
  <h3>Name</h3>
  <input id="name-input" placeholder="Name" type="string"></input>
  <h3>Description</h3>
  <input id="description-input" placeholder="Description" type="string"></input>
  <h3>Date</h3>
  <input id="date-input" type="date"></input>
  <h3>Location</h3>
  <input id="location-input" placeholder="Location" type="string"></input></br>
  <button id="add-party">Add Party</button>
  </form>
  `;
  return $inputs;
}

// === Render ===
function render() {
  const $app = document.querySelector("#app");
  $app.innerHTML = `
    <h1>Party Planner</h1>
    <main>
      <section>
        <h2>Upcoming Parties</h2>
        <PartyList></PartyList>
      </section>
      <section id="selected">
        <h2>Party Details</h2>
        <SelectedParty></SelectedParty>
      </section>
      <section id="inputs-container">
        <h2>Add new party</h2>
        <inputs></inputs>
      </section>
    </main>
  `;

  $app.querySelector("PartyList").replaceWith(PartyList());
  $app.querySelector("SelectedParty").replaceWith(SelectedParty());
  $app.querySelector("inputs").replaceWith(createInputs());
  formEvent();
}

async function init() {
  await getParties();
  await getRsvps();
  await getGuests();
  render();
}

init();
