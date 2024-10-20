// Array to store quotes, each quote has 'text' and 'category'
// Array to store quotes, which will be initialized from local storage if available
let quotes = JSON.parse(localStorage.getItem('quotes')) || [
    { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" },
    { text: "In the end, we will remember not the words of our enemies, but the silence of our friends.", category: "Leadership" },
    { text: "Life is what happens when you're busy making other plans.", category: "Life" }
  ];

// Function to display a random quote
function showRandomQuote() {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];

  const quoteDisplay = document.getElementById("quoteDisplay");
  quoteDisplay.innerHTML = `<p>${quote.text} - <strong>${quote.category}</strong></p>`;

  // Store the last displayed quote in session storage
  sessionStorage.setItem('lastQuote', JSON.stringify(quote));
}

// Add event listener to 'Show New Quote' button
document.getElementById("newQuote").addEventListener("click", showRandomQuote);

// Function to dynamically create the 'Add Quote' form and add it to the DOM
function createAddQuoteForm() {
    const formDiv = document.createElement('div');
  
    const quoteInput = document.createElement('input');
    quoteInput.setAttribute('id', 'newQuoteText');
    quoteInput.setAttribute('type', 'text');
    quoteInput.setAttribute('placeholder', 'Enter a new quote');
  
    const categoryInput = document.createElement('input');
    categoryInput.setAttribute('id', 'newQuoteCategory');
    categoryInput.setAttribute('type', 'text');
    categoryInput.setAttribute('placeholder', 'Enter quote category');
  
    const addButton = document.createElement('button');
    addButton.textContent = 'Add Quote';
    addButton.onclick = addQuote;
  
    formDiv.appendChild(quoteInput);
    formDiv.appendChild(categoryInput);
    formDiv.appendChild(addButton);
  
    document.body.appendChild(formDiv);
  }

// Function to add a new quote from user input
function addQuote() {
  const newQuoteText = document.getElementById("newQuoteText").value;
  const newQuoteCategory = document.getElementById("newQuoteCategory").value;

  if (newQuoteText && newQuoteCategory) {
    // Add new quote to the quotes array
    quotes.push({ text: newQuoteText, category: newQuoteCategory });

    // Save the updated quotes array to local storage
    saveQuotes();

    // Update categories dropdown
    populateCategories();

    // Post the new quote to the server
    postQuoteToServer(newQuote);

    // Clear input fields
    document.getElementById("newQuoteText").value = "";
    document.getElementById("newQuoteCategory").value = "";

    alert("New quote added!");
  } else {
    alert("Please enter both quote text and category.");
  }
}

// Function to export quotes as a JSON file
document.getElementById('exportQuotes').addEventListener('click', function() {
    const data = JSON.stringify(quotes, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quotes.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  });

  // Function to import quotes from a JSON file
function importFromJsonFile(event) {
    const fileReader = new FileReader();
    
    fileReader.onload = function(event) {
      const importedQuotes = JSON.parse(event.target.result);
      quotes.push(...importedQuotes); // Spread operator to merge arrays
      
      // Save the updated quotes array to local storage
      saveQuotes();
      
      alert('Quotes imported successfully!');
    };
    
    fileReader.readAsText(event.target.files[0]);
  }

  // Function to dynamically populate the category dropdown
function populateCategories() {
    const categories = ['all', ...new Set(quotes.map(quote => quote.category))];
    const categoryFilter = document.getElementById('categoryFilter');
    
    // Clear existing options
    categoryFilter.innerHTML = '';
    
    // Populate with dynamic categories
    categories.forEach(category => {
      const option = document.createElement('option');
      option.value = category;
      option.textContent = category;
      categoryFilter.appendChild(option);
    });
  
    // Restore last selected filter from local storage
    const lastSelectedCategory = localStorage.getItem('selectedCategory');
    if (lastSelectedCategory) {
      categoryFilter.value = lastSelectedCategory;
    }
  }
  
  // Function to display quotes based on the selected category
  function filterQuotes() {
    const selectedCategory = document.getElementById('categoryFilter').value;
    
    // Store the selected category in local storage
    localStorage.setItem('selectedCategory', selectedCategory);
    
    const filteredQuotes = selectedCategory === 'all'
      ? quotes
      : quotes.filter(quote => quote.category === selectedCategory);
    
    const quoteDisplay = document.getElementById('quoteDisplay');
    quoteDisplay.innerHTML = filteredQuotes.map(quote => `<p>${quote.text} - <strong>${quote.category}</strong></p>`).join('');
  }

  const SERVER_URL = "https://jsonplaceholder.typicode.com/posts"; // Placeholder API endpoint

  // Function to fetch quotes from the "server"
  async function fetchQuotesFromServer() {
    try {
      const response = await fetch(SERVER_URL);
      const serverQuotes = await response.json();
      console.log('Fetched quotes from server:', serverQuotes);
      
      // Simulate quote objects from the server
      return serverQuotes.map(post => ({
        text: post.title, // Use title from JSONPlaceholder as quote text
        category: "General" // Simulate a default category
      }));
    } catch (error) {
      console.error("Error fetching quotes from server:", error);
      return []; // Return empty array on error
    }
  }
  
  // Function to post a new quote to the "server"
  async function postQuoteToServer(quote) {
    try {
      const response = await fetch(SERVER_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(quote)
      });
  
      const result = await response.json();
      console.log('Posted new quote to server:', result);
    } catch (error) {
      console.error("Error posting new quote to server:", error);
    }
  }
  
  // Function to sync quotes from server to local storage
  async function syncQuotesWithServer() {
    const serverQuotes = await fetchQuotesFromServer();
    
    if (serverQuotes) {
      const mergedQuotes = mergeQuotes(localStorage.getItem('quotes'), serverQuotes);
      localStorage.setItem('quotes', JSON.stringify(mergedQuotes));
  
      // Show success message to the user
      displaySyncMessage("Quotes synced with server!");
    }
  }
  
  // Function to merge local and server quotes
  function mergeQuotes(localQuotes, serverQuotes) {
    const local = JSON.parse(localQuotes) || [];
    
    // Simple conflict resolution: server's data takes precedence
    const merged = [...serverQuotes];
    local.forEach(localQuote => {
      if (!serverQuotes.find(sq => sq.text === localQuote.text)) {
        merged.push(localQuote); // Add local quote if it's not already on the server
      }
    });
    
    return merged;
  }
  
  // Function to display sync success message
  function displaySyncMessage(message) {
    const syncMessage = document.createElement('div');
    syncMessage.id = 'syncMessage';
    syncMessage.textContent = message;
    document.body.appendChild(syncMessage);
  
    // Remove the message after 5 seconds
    setTimeout(() => {
      document.getElementById('syncMessage').remove();
    }, 5000); // Display for 5 seconds
  }
  
  // Periodic syncing
  setInterval(syncQuotesWithServer, 30000); // Sync every 30 seconds
  
  
  

// On page load, check if a quote was displayed in the current session
window.onload = function() {
    populateCategories();
  filterQuotes();
    const lastQuote = sessionStorage.getItem('lastQuote');
    if (lastQuote) {
      const quote = JSON.parse(lastQuote);
      const quoteDisplay = document.getElementById('quoteDisplay');
      quoteDisplay.innerHTML = `<p>${quote.text} - <strong>${quote.category}</strong></p>`;
    }
  };

// Call the createAddQuoteForm function to dynamically create the form on page load
createAddQuoteForm();

// Function to save quotes to local storage
function saveQuotes() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
    syncQuotesWithServer();
  }

