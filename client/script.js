// import bot from './assets/bot.svg';
// import user from './assets/user.svg';
import user from './assets/user2.png';
import bot from './assets/favicon.ico'

// fetch the form and chat container from the html :
const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');

let loadInterval;

// utility for loading functionality while the bot's thinking : this shows 3 dots 
// reappearing continuously as if the bot's THINKING !! , basically we intiate an
// empty string as the text content and keep incrementing the dots , upto 4 dots 
// after which we reset the string => done using callback !!
function loader(element){
	element.textContent = '';
	loadInterval = setInterval(()=>{
	element.textContent += '.';
	if(element.textContent === '....'){
		element.textContent =  '';
	}
	},300)
}

// utility for the bot to type the text : we initiate an index to 0, then we keep
// on printing the bot's response char by char using the index as the inner HTML 
// content line by line and once the line finishes we clear interval so as to do
// the writing of the next line; all this is done within intervals of 20 msec.
function typeText (element , text){
	let index = 0;
	let interval = setInterval(()=>{
	if(index < text.length){
		element.innerHTML += text.charAt(index);
		index++;
	}
	else{
		clearInterval(interval);
	}
	},20)
}

// utility to generate unique ids for each message in the user-bot conversation.
function generateUniqueId (){
	const timestamp = Date.now(); // fetches current time
	const randomNumber = Math.random(); // a random No. is generated 
	const hexString = randomNumber.toString(16); // we concat (date + randomNumer)
	// as a unique ID to be attached to each message -> to ensure uniqueness !!
	return `id-${timestamp}-${hexString}`;
}


// utility to provide a different chat stripe to user as well as bot messages to
// give a feel of a on going chat conversation :
function chatStripe (isAi , value , uniqueId){
	return (
		// we are returning a template string wrapped html to 
		// render the icons of bot / user based on who's doin
		// the talking !!
		`
			<div class="wrapper ${isAi && 'ai'}">
				<div class="chat>
					<div class="profile">
						<img
							src="${isAi ? bot : user}"
							alt="${isAi ? 'bot' : 'user'}"
						/>
					</div>
					<div class="message" id=${uniqueId}>${value}</div>
				</div>
			</div>
		`
	)
}

// utility for Handle submit : to handle the submission of user queries to
// the AI using a async utility !!
const handleSubmit = async(e) => {
	e.preventDefault();
	// get the data / user query from the form so submitted :
	const data = new FormData(form); 

	// generate the user's chat stripe :
	chatContainer.innerHTML += chatStripe(false,data.get('prompt'));
	form.reset(); // clear the textarea !!

	// generate bot's chat stripe :
	const uniqueId = generateUniqueId(); // generate unique id for bot's reply
	chatContainer.innerHTML += chatStripe(true," ",uniqueId); // generate stripe
	chatContainer.scrollTop = chatContainer.scrollHeight; // this brings new 
	// msgs in view !!

	// fetch the message using the unique ids so generated !!
	const messageDiv = document.getElementById(uniqueId);

	loader(messageDiv); // turn on the loader.

	// fetch the data from server : bot's response :
	const response = await fetch('http://localhost:5000',{
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			prompt: data.get('prompt')
		})
	})
	// clear the response and start loading for next response
	clearInterval(loadInterval);
	messageDiv.innerHTML = '';

	if(response.ok){
		// fetching the actual response coming from the backend
		// then parsing the data and typing the response using 
		// the required utility so implemented above !!
		const data = await response.json();
		const parsedData = data.bot.trim();
		typeText(messageDiv,parsedData);
	}
	else{
		// there's some error in fetching the response !!
		const err = await response.text();
		messageDiv.innerHTML = "[ERROR 404] Something Went Wrong...!!";
		alert(err);
	}
}

// utility to handle the query submission :
form.addEventListener('submit',handleSubmit); // handlesubmit passed as callback
// logic to handle submissions on pressing enter :
form.addEventListener('keyup',(e)=>{
	if(e.keyCode === 13){
		handleSubmit(e);
	}
})





