const API_URL="https://cmagency.onrender.com";
document.addEventListener("DOMContentLoaded",()=>{
 const username=localStorage.getItem("username");
 const password=localStorage.getItem("password");
 if(username && password){autoLogin(username,password);}
 loadCategories();
 loadItems();
});
function loadCategories(){
 fetch("kategorije.json")
 .then(response=>response.json())
 .then(data=>{
  const categoryList=document.getElementById("categoryList");
  const filterCategoryList=document.getElementById("filterCategoryList");
  categoryList.innerHTML="";
  filterCategoryList.innerHTML="";
  data.forEach(category=>{
   const option=document.createElement("option");
   option.value=category;
   categoryList.appendChild(option);
   const filterOption=document.createElement("option");
   filterOption.value=category;
   filterCategoryList.appendChild(filterOption);
  });
 })
 .catch(error=>console.error("Greška pri učitavanju kategorija:",error));
}
function login(){
 const username=document.getElementById("username").value;
 const password=document.getElementById("password").value;
 fetch(`${API_URL}/login`,{
  method:"POST",
  headers:{"Content-Type":"application/json"},
  body:JSON.stringify({username,password})
 })
 .then(response=>{
  if(!response.ok){throw new Error("Neuspešna prijava");}
  return response.json();
 })
 .then(data=>{
  localStorage.setItem("username",username);
  localStorage.setItem("password",password);
  showContent();
  loadItems();
 })
 .catch(()=>alert("Pogrešno korisničko ime ili lozinka"));
}
function autoLogin(username,password){
 fetch(`${API_URL}/login`,{
  method:"POST",
  headers:{"Content-Type":"application/json"},
  body:JSON.stringify({username,password})
 })
 .then(response=>{
  if(!response.ok){throw new Error("Neuspešan auto login");}
  return response.json();
 })
 .then(data=>{
  showContent();
  loadItems();
 })
 .catch(()=>logout());
}
function logout(){
 localStorage.removeItem("username");
 localStorage.removeItem("password");
 document.getElementById("content").classList.add("hidden");
 document.getElementById("log").classList.remove("hidden");
}
function showContent(){
 document.getElementById("log").classList.add("hidden");
 document.getElementById("content").classList.remove("hidden");
}
function cleanURL(url){
 url=url.split("?")[0];
 url=url.replace("https://www.","https://").replace("http://www.","http://");
 if(url.includes("instagram.com")){
  url=url.replace("https://www.instagram.com","https://instagram.com");
  url=url.replace("http://www.instagram.com","http://instagram.com");
 }
 return url;
}
function addItem(){
 const textInput=document.getElementById("textInput").value.trim();
 const categoryInput=document.getElementById("categoryInput").value.trim();
 if(!textInput||!categoryInput)return;
 const cleanedTextInput=cleanURL(textInput);
 fetch(`${API_URL}/add`,{
  method:"POST",
  headers:{"Content-Type":"application/json"},
  body:JSON.stringify({item:cleanedTextInput,category:categoryInput})
 })
 .then(response=>response.json())
 .then(data=>{
  if(data.success){
   updateList(data.items);
   document.getElementById("textInput").value="";
   document.getElementById("categoryInput").value="";
  }
 })
 .catch(error=>console.error("Greška pri dodavanju stavki:",error));
}
function downloadList(){
 fetch(`${API_URL}/download`)
 .then(response=>response.blob())
 .then(blob=>{
  const a=document.createElement("a");
  a.href=URL.createObjectURL(blob);
  a.download="lista.txt";
  a.click();
 });
}
function filterItems() {
    const filterCategoryInput = document.getElementById("filterCategoryInput").value.trim();
    if (!filterCategoryInput) {
      loadItems();
      return;
    }
    fetch(`${API_URL}/items`)
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          const filteredItems = data.items.filter(item => {
            return item.category && item.category.trim() === filterCategoryInput;
          });
          if (filteredItems.length === 0) {
            // Ako nema filtriranih stavki, prikazujemo sve stavke (privremeno rešenje)
            updateList(data.items);
          } else {
            updateList(filteredItems);
          }
        }
      })
      .catch(error => {
        console.error("Greška pri učitavanju stavki:", error);
      });
  }
  
function updateList(items){
 const list=document.getElementById("list");
 list.innerHTML="";
 items.reverse().forEach(i=>{
  const li=document.createElement("li");
  const cleanedLink=cleanURL(i.name);
  const urlPattern=/^(https?:\/\/)?(www\.)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
  if(urlPattern.test(cleanedLink)){
   const url=new URL(cleanedLink.startsWith("http")?cleanedLink:`https://${cleanedLink}`);
   const link=document.createElement("a");
   link.href=cleanedLink;
   link.textContent=url.hostname.replace(/^www\./,"")+url.pathname.replace(/\/+$/,"");
   link.target="_blank";
   li.appendChild(link);
  }else{
   li.textContent=i.count>1?`${i.name} (x${i.count})`:i.name;
  }
  const deleteButton=document.createElement("button");
  deleteButton.textContent="X";
  deleteButton.classList.add("delete");
  deleteButton.addEventListener("click",e=>{
   e.stopPropagation();
   deleteItem(i.name);
  });
  li.addEventListener("click",e=>{
   if(e.target!==deleteButton){li.classList.toggle("line-through");}
  });
  li.appendChild(deleteButton);
  list.appendChild(li);
 });
}
function deleteItem(itemName){
 fetch(`${API_URL}/delete/${encodeURIComponent(itemName)}`,{
  method:"DELETE"
 })
 .then(response=>response.json())
 .then(data=>{
  if(data.success){updateList(data.items);}
 });
}
function loadItems(){
 fetch(`${API_URL}/items`)
 .then(response=>response.json())
 .then(data=>{
  if(data.success){updateList(data.items);}
 })
 .catch(error=>console.error("Greška pri učitavanju stavki:",error));
}
