let tarotData = [];

fetch('tarot.json')
  .then(response => response.json())
  .then(data => {
    tarotData = data.cards;
  });

document.getElementById('drawTenBtn').addEventListener('click', () => {
  if (tarotData.length < 10) return;

  const shuffled = [...tarotData].sort(() => 0.5 - Math.random());
  const selectedCards = shuffled.slice(0, 10);

  const displayContainer = document.getElementById('tenCardDisplay');
  displayContainer.innerHTML = '';

  selectedCards.forEach((card, index) => {
    const isReversed = Math.random() < 0.5;
    const meaning = isReversed ? card.meaning_rev : card.meaning_up;

    // 🔄 แปลงชื่อไพ่ให้เป็นชื่อไฟล์
    const imageName = getImageFileName(card);
    const imageSrc = `/image/${imageName}.jpeg`;

    const cardEl = document.createElement('div');
    cardEl.className = 'bg-white/10 p-4 rounded-lg border border-white/20 shadow-md text-center';

    cardEl.innerHTML = `
      <img src="${imageSrc}" alt="${card.name}" class="mx-auto mb-3 rounded-lg shadow-md max-h-52 object-contain" />
      <h2 class="text-xl font-semibold mb-1">#${index + 1}: ${card.name} ${isReversed ? "(Reversed)" : ""}</h2>
      <p class="text-purple-300 italic mb-2">${meaning}</p>
      <p class="text-sm text-gray-300">${card.desc}</p>
    `;

    displayContainer.appendChild(cardEl);
  });
});

// 🧠 แปลงชื่อไพ่เป็นชื่อไฟล์ เช่น "Ace of Cups" => "aceofcups"
function getImageFileName(card) {
  const baseName = (card.name || card.name_short || "").toLowerCase().replace(/\s+/g, '');
  return baseName;
}
