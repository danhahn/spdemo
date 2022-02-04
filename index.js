let siteData = [];

let maxColumns = [];

let modalIsOpen = false;

let currentRow = 0;
let currentColumn = 0;
let maxRows = 0;

document.addEventListener('keydown', updateCurrentSelected);

function updateSelectedItem() {
  const currentSelectedItem = document.querySelector('.selected');
  currentSelectedItem.classList.remove('selected');
  const newSelectedItem = document.querySelector(
    `[data-column="${currentRow}-${currentColumn}"]`,
  );
  newSelectedItem.classList.add('selected');
  newSelectedItem.scrollIntoView();
}

function closeModel() {
  const overlay = document.getElementById('overlay');
  overlay.classList.remove('open');
  const modalDOM = document.getElementById('modal');
  modalDOM.innerHTML = '';
  modalIsOpen = false;
}

function updateCurrentSelected(event) {
  if (!modalIsOpen) {
    if (event.key === 'ArrowDown') {
      const next = currentRow + 1;
      if (next === maxRows) return;
      currentRow = next;
      updateSelectedItem();
    }
    if (event.key === 'ArrowUp') {
      const next = currentRow - 1;
      if (next === -1) return;
      currentRow = currentRow - 1;
      updateSelectedItem();
    }
    if (event.key === 'ArrowRight') {
      const next = currentColumn + 1;
      if (next === maxColumns[currentRow]) return;
      currentColumn = next;
      updateSelectedItem();
    }
    if (event.key === 'ArrowLeft') {
      const next = currentColumn - 1;
      if (next === -1) return;
      currentColumn = currentColumn - 1;
      updateSelectedItem();
    }
    if (event.key === 'Enter') {
      const selectedItem = document.querySelector(
        `[data-column="${currentRow}-${currentColumn}"]`,
      );

      const modal = document.createElement('div');
      modal.classList.add('modal');

      modal.innerHTML = `
      <h1>Play Video</h1>
      ${selectedItem.id}
        
      `;
      const modalDOM = document.getElementById('modal');
      const overlay = document.getElementById('overlay');
      overlay.addEventListener('click', closeModel);

      overlay.classList.add('open');
      modalDOM.appendChild(modal);
      modalIsOpen = true;
    }
  }
  if (event.key === 'Escape') {
    closeModel();
  }
}

function normalizeItems(item) {
  const id = item.contentId || item.collectionId;
  const img =
    item.image.tile['1.78'].series?.default?.url ||
    item.image.tile['1.78'].program?.default?.url ||
    item.image.tile['1.78'].default?.default?.url;
  const title =
    item.text.title.full.series?.default?.content ||
    item.text.title.full.program?.default?.content ||
    item.text.title.full.default?.default?.content;
  const slug =
    item.text.title.slug?.series?.default?.content ||
    item.text.title.slug?.program?.default?.content ||
    item.text.title.slug?.default?.default?.content;

  return { id, img, title, slug };
}

function normalizeData({ set }) {
  const id = set.setId;
  const title = set.text.title.full.set.default.content;
  const items = set.items?.map(normalizeItems);
  return { title, items, id };
}

function buildPage(siteData) {
  const root = document.getElementById('root');

  siteData.forEach((item, index) => {
    const contentRow = document.createElement('div');
    contentRow.setAttribute('class', 'content-row');
    contentRow.innerHTML = `
      <h2>${item.title}</h2>
      <div class="wrapper">   
        <ul class="content-list" data-row="${index}">
          ${item.items
            .map(
              (item, rowIndex) => `
            <li id="${item.id}" data-column="${index}-${rowIndex}">
              <img src="${item.img}" alt="${item.title}"/>
            </li>
          `,
            )
            .join('')}
        </ul>
      </div>
    `;

    maxRows = siteData.length;

    maxColumns = [...maxColumns, item.items.length];

    root.appendChild(contentRow);
  });

  const firstItem = document.querySelector(
    `[data-column="${currentRow}-${currentColumn}"]`,
  );

  firstItem.classList.add('selected');
}

async function init() {
  const rawData = await fetch(
    'https://cd-static.bamgrid.com/dp-117731241344/home.json',
  );
  const {
    data: {
      StandardCollection: { containers },
    },
  } = await rawData.json();

  const cleanData = containers.map(normalizeData).filter(data => data.items);

  siteData = [...cleanData];

  console.log(siteData);
  buildPage(siteData);
}

init();
