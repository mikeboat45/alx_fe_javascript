document.addEventListener('DOMContentLoaded', () => {
  const quoteDisplay = document.getElementById('quoteDisplay');
  const newQuoteButton = document.getElementById('newQuote');
  const exportQuotesButton = document.getElementById('exportQuotes');
  const importFileInput = document.getElementById('importFile');
  const categoryFilter = document.getElementById('categoryFilter');

  const initialQuotes = [
    { text: "The only way to do great work is to love what you do.", category: "Inspiration" },
    { text: "Innovation distinguishes between a leader and a follower.", category: "Technology" },
    { text: "Strive not to be a success, but rather to be of value.", category: "Life" }
  ];

  let quotes = JSON.parse(localStorage.getItem('quotes')) || initialQuotes;

  function saveQuotes() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
  }

  function showQuote(quote) {
    if (quote) {
      quoteDisplay.innerHTML = `<p>"${quote.text}" - <em>${quote.category}</em></p>`;
      sessionStorage.setItem('lastViewedQuote', JSON.stringify(quote));
    } else {
      quoteDisplay.innerHTML = `<p>No quotes available for this category.</p>`;
    }
  }

  function populateCategories() {
    const categories = ['all', ...new Set(quotes.map(quote => quote.category))];
    categoryFilter.innerHTML = ''; // Clear existing options
    categories.forEach(category => {
      const option = document.createElement('option');
      option.value = category;
      option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
      categoryFilter.appendChild(option);
    });
    const lastSelectedCategory = localStorage.getItem('lastFilterCategory') || 'all';
    categoryFilter.value = lastSelectedCategory;
  }

  function filterQuotes() {
    const selectedCategory = categoryFilter.value;
    localStorage.setItem('lastFilterCategory', selectedCategory);

    if (selectedCategory === 'all') {
      showRandomQuote();
      return;
    }

    const filteredQuotes = quotes.filter(quote => quote.category === selectedCategory);
    if (filteredQuotes.length > 0) {
      const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
      const randomQuote = filteredQuotes[randomIndex];
      showQuote(randomQuote);
    } else {
      showQuote(null);
    }
  }

  function showRandomQuote() {
    if (quotes.length > 0) {
      const randomIndex = Math.floor(Math.random() * quotes.length);
      const randomQuote = quotes[randomIndex];
      showQuote(randomQuote);
    } else {
      showQuote(null);
    }
  }

  function addQuote() {
    const newQuoteText = document.getElementById('newQuoteText').value;
    const newQuoteCategory = document.getElementById('newQuoteCategory').value;

    if (newQuoteText && newQuoteCategory) {
      quotes.push({ text: newQuoteText, category: newQuoteCategory });
      saveQuotes();
      populateCategories(); // Update categories dropdown
      document.getElementById('newQuoteText').value = '';
      document.getElementById('newQuoteCategory').value = '';
      alert('New quote added successfully!');
      showQuote(quotes[quotes.length - 1]);
    } else {
      alert('Please fill in both fields.');
    }
  }

  function createAddQuoteForm() {
    const formContainer = document.createElement('div');
    formContainer.innerHTML = `
      <hr>
      <h3>Add Your Own Quote</h3>
      <input id="newQuoteText" type="text" placeholder="Enter a new quote" />
      <input id="newQuoteCategory" type="text" placeholder="Enter quote category" />
      <button id="addQuoteBtn">Add Quote</button>
    `;
    document.body.insertBefore(formContainer, document.querySelector('script'));
    document.getElementById('addQuoteBtn').addEventListener('click', addQuote);
  }

  function exportToJsonFile() {
    if (quotes.length === 0) {
      alert('There are no quotes to export.');
      return;
    }
    const jsonString = JSON.stringify(quotes, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quotes.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  function importFromJsonFile(event) {
    const fileReader = new FileReader();
    fileReader.onload = function(event) {
      try {
        const importedQuotes = JSON.parse(event.target.result);
        if (Array.isArray(importedQuotes)) {
          quotes.push(...importedQuotes);
          saveQuotes();
          populateCategories(); // Update categories dropdown
          alert('Quotes imported successfully!');
          filterQuotes(); // Refresh display based on current filter
        } else {
          alert('Invalid JSON format. Please import an array of quotes.');
        }
      } catch (error) {
        alert('Error reading or parsing the file. Please ensure it is a valid JSON file.');
        console.error('Import Error:', error);
      }
    };
    if (event.target.files[0]) {
      fileReader.readAsText(event.target.files[0]);
    }
  }

  // --- Initial Setup ---
  newQuoteButton.addEventListener('click', filterQuotes); // Changed to respect filter
  exportQuotesButton.addEventListener('click', exportToJsonFile);
  importFileInput.addEventListener('change', importFromJsonFile);
  categoryFilter.addEventListener('change', filterQuotes);

  createAddQuoteForm();
  populateCategories();
  filterQuotes(); // Show a quote on initial load based on the saved filter

  if (!localStorage.getItem('quotes')) {
    saveQuotes();
  }
});
