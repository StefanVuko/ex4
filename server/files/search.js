function search() {
  /* Task 1.2: Initialize the searchForm correctly */
  const searchForm = document.getElementById("search");

  if (searchForm.reportValidity()) {
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
      const sectionElement = document.querySelector("section:nth-of-type(2)");

      while (sectionElement.childElementCount > 0) {
        sectionElement.firstChild.remove();
      }

      if (xhr.status === 200) {
        const results = JSON.parse(xhr.responseText);


        /* Task 1.3 Insert the results as specified. Do NOT
           forget to also cover the case in which no results
           are available. 
          */
        if (results.length === 0) {
          let p = document.createElement("p")
          p.textContent = "No results for your query '" + searchForm.query.value + "' found."
          sectionElement.appendChild(p)
        }

        else {
          let form = document.createElement("form")

          results.forEach(movie => {
            let article = document.createElement("article")

            let input = document.createElement("input")
            input.type = "checkbox"
            input.className = "check"
            input.value = movie.imdbID
            input.id = movie.imdbID

            let label = document.createElement("label")
            label.htmlFor = movie.imdbID
            label.textContent = movie.Title

            article.appendChild(input)
            article.appendChild(label)

            form.appendChild(article)

          });

          let button = document.createElement("button")
          button.textContent = "Add selected to collection"
          button.addEventListener("click", () => addMovies(form))
          //button.onclick = addMovies(form)

          form.appendChild(button)

          sectionElement.appendChild(form)
        }
      }
    };
    /* Task 1.2: Finish the xhr configuration and send the request */
    xhr.open("GET", "/search?query=" + searchForm.query.value);
    xhr.send();
  }
}

/* Task 2.1. Add a function that you use as an event handler for when
   the button you added above in 1.3. is clicked. In it, call the
   POST /addMovies endpoint and pass the array of imdbID to be added
   as payload. */

function addMovies(form) {
  //var values = form.querySelectorAll(":checked").value
  let x = document.forms[1]
  let checkedMovies = []

  for (let i = 0; i < x.length; i++) {
    if (x[i].checked) {
      checkedMovies.push(x[i].value)
    }
  }


  let data = JSON.stringify(checkedMovies)
  //data = data.replaceAll('"', " ")

  const xhr = new XMLHttpRequest();
  xhr.open("POST", "/movies")
  xhr.setRequestHeader("Content-Type", "application/json")
  xhr.send(data)
}

window.onload = function () {
  document.getElementById("search").addEventListener("click", () => search());
};
