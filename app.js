const formWrapper = document.querySelector(".form-wrapper");
const form = document.querySelector("#form");
const searchInput = document.querySelector("#searchInput");
const buttonWrapper = document.querySelector(".button-wrapper");
const searchButton = document.querySelector("#searchButton");
const clearButton = document.querySelector("#clearButton");
const imageListWrapper = document.querySelector(".imageList-wrapper");
const loader = document.querySelector("#loader");
const emptyState = document.querySelector("#emptyState");
const aiSuggestion = document.querySelector("#aiSuggestion");
const chipWrapper = document.querySelector("#chipWrapper");

runEventListeners();

function runEventListeners(){
    form.addEventListener("submit", search);
    clearButton.addEventListener("click", clear);
    searchInput.addEventListener("input", handleAiSuggestion);
    chipWrapper.addEventListener("click", handleChipClick);
}

function clear(){
    searchInput.value = "";
    imageListWrapper.innerHTML = "";
    if(emptyState){
        emptyState.classList.remove("hidden");
        imageListWrapper.appendChild(emptyState);
    }
}

function setLoading(isLoading){
    if(!loader) return;
    if(isLoading){
        loader.classList.remove("hidden");
    }else{
        loader.classList.add("hidden");
    }
}

function handleAiSuggestion(e){
    const value = e.target.value.trim().toLowerCase();

    if(!aiSuggestion) return;

    if(!value){
        aiSuggestion.textContent =
            'Bugün ne aramak istersin? “nature”, “city night”, “minimal desk” deneyebilirsin.';
        return;
    }

    if(value.includes("city") || value.includes("şehir") || value.includes("urban")){
        aiSuggestion.textContent =
            'Şehir temalı kareler için “city night”, “urban street”, “neon lights” deneyebilirsin.';
    }else if(value.includes("nature") || value.includes("doğa") || value.includes("forest")){
        aiSuggestion.textContent =
            'Doğa için “forest”, “mountain”, “misty landscape”, “waterfall” gibi kelimeler kullanabilirsin.';
    }else if(value.includes("minimal") || value.includes("desk") || value.includes("workspace")){
        aiSuggestion.textContent =
            'Minimal çalışma alanları için “minimal desk setup”, “clean workspace”, “aesthetic office” yazabilirsin.';
    }else if(value.includes("portrait") || value.includes("people") || value.includes("insan")){
        aiSuggestion.textContent =
            'Portreler için “portrait”, “street portraits”, “cinematic portrait”, “moody portrait” deneyebilirsin.';
    }else{
        aiSuggestion.textContent =
            `"${value}" için daha spesifik sonuç istersen yanına stil ekleyebilirsin: “${value} cinematic”, “${value} minimal”, “${value} vintage” gibi.`;
    }
}


function handleChipClick(e){
    if(e.target.classList.contains("chip")){
        const text = e.target.textContent;
        searchInput.value = text;
        handleAiSuggestion({ target: searchInput });
        form.dispatchEvent(new Event("submit")); 
    }
}

function search(e){
    e.preventDefault();

    const value = searchInput.value.trim();

    if(!value){
        if(aiSuggestion){
            aiSuggestion.textContent = "Lütfen aramak için bir kelime yaz 🙃";
        }
        return;
    }

    setLoading(true);
    imageListWrapper.innerHTML = "";

    fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(value)}&per_page=20`,{
        method : "GET",
        headers : {
            Authorization : "Client-ID _rFHX8fB9jsK5GM2YyevRPtbrFG4KNIQxYXh1Qlr308"
        }
    })
    .then((res)=> res.json())
    .then((data)=> {
        setLoading(false);

        if(emptyState){
            emptyState.classList.add("hidden");
        }

        if(!data.results || data.results.length === 0){
            const info = document.createElement("div");
            info.className = "empty-state";
            info.innerHTML = `
                <h2>Sonuç bulunamadı</h2>
                <p>"${value}" için sonuç yok. Kelimeyi biraz daha genel yapmayı deneyebilirsin.</p>
            `;
            imageListWrapper.append(info);
            return;
        }

        Array.from(data.results).forEach((image)=>{
            addImageUI(image);  
        });
    })
    .catch((err)=> {
        console.log(err);
        setLoading(false);

        const errorDiv = document.createElement("div");
        errorDiv.className = "empty-state";
        errorDiv.innerHTML = `
            <h2>Bir şeyler ters gitti</h2>
            <p>Lütfen internet bağlantını kontrol et veya biraz sonra tekrar dene.</p>
        `;
        imageListWrapper.append(errorDiv);
    });
}

function addImageUI(image){
    const { urls, alt_description, user, links } = image;

    const div = document.createElement("div");
    div.className = "card";

    const img = document.createElement("img");
    img.setAttribute("src", urls.small);
    img.setAttribute("alt", alt_description || "Unsplash image");

    const footer = document.createElement("div");
    footer.className = "card-footer";

    const authorSpan = document.createElement("span");
    authorSpan.className = "card-author";
    authorSpan.textContent = user && user.name ? user.name : "Bilinmeyen fotoğrafçı";

    const link = document.createElement("a");
    link.className = "card-link";
    link.setAttribute("href", links.html);
    link.setAttribute("target", "_blank");
    link.setAttribute("rel", "noopener noreferrer");
    link.textContent = "Görüntüle";

    footer.append(authorSpan, link);
    div.append(img, footer);
    imageListWrapper.append(div);
}