// Coffee Shop Interactive Story
// A game where the player selects a barista and follows a branching dialogue path

// Global variables
let state = "selection"; // start with barista selection
let selectedBarista = "";
let currentQuestion = "";
let responseOptions = [];
let showBlankImage = false;
let responseImages = {};
let yourName = "";
let userInput = "";
let maxCharacters = 10;
let checkmarkVisible = false;
let displayTimer = 0;
let timerStarted = false;
let showOptions = false;
let repeatCount = 0;
let peteRepeatCount = 0; // Track how many times "Can you repeat that please?" is selected
let isTypingActive = false; // Flag to track if typing is active
let cursorPosition = 0; // Track cursor position within text
let lastCursorBlink = 0; // For cursor blinking
let cursorVisible = true; // For cursor blinking
const CURSOR_BLINK_RATE = 500; // Blink every 500ms
let pixellariFont; // Variable to store the Pixellari font
let showEndScreen = false; // Flag to show the end screen

let introVideo;
let introVideoPlaying = true;
let introVideoLoaded = false;

let backgroundMusic;
let musicVolume = 0.1; // 10% volume



// AUDIO VARIABLES - Add these at the top with other global variables
let peteDefaultAudio, peteConfusedAudio, peteTiredAudio, peteAngryAudio;
let meowchiDefaultAudio, meowchiConfusedAudio, meowchiWorriedAudio, meowchiKindAudio;
let currentAudio = null;
let audioPlayed = {};

// Text selection variables
let selectionMode = 'none'; // 'none', 'word', 'all'
let selectionStart = -1;
let selectionEnd = -1;
let selectionInProgress = false; // Track if user is currently dragging to select text
let dragStartPos = -1; // Starting position for drag selection

// Time variables
const ORIGINAL_PETE_ORDER_TIME = 0.2;
let peteOrderTime = ORIGINAL_PETE_ORDER_TIME; // seconds for initial order question
let drinkOrderTime = 1; // seconds for drink order question
let rejectionTime = 4; // seconds for rejection message

// Pete video variables
let peteQ4Video, peteVideoPlaying = false, peteVideoFinished = false;

// Meowchi sequence variables
let meowchiBackground, meowchiQ1Image, meowchiBlankConfusedImage;
let meowchiQ2Image; // Added for updated sequence
let meowchiQ3Image, meowchiQ4_1Image, meowchiQ4_2Image, meowchiQ5Image;
let meowchiQ5_1Image, meowchiQ5_2Image;
let meowchiQ6Video, meowchiBlankImage, meowchiVideoPlaying = false, meowchiVideoFinished = false;
let meowchiQ7_1Image, meowchiQ7_2Image, meowchiQ7_3Image, meowchiQ8Image;
let meowishSequenceActive = false;
let meowOrderTime = 2; // Time for meowchi order questions (seconds)
let frenchOrderTime = 2; // Time for French questions (seconds)
let meowchiExitDelay = false; // Flag for handling the exit delay

// Additional mapping for Meowchi response options
const meowchiResponseImages = {};

// Image and background variables (will be populated in preload)
let peteBackground, peteQ1Image, peteBlankImage, peteQ3R2Image, peteQ3Image, 
    peteQ5_1Image, peteQ5_2Image, peteQ6Image, blankInputImage, checkmarkImage, mugBackground;
let peteQ1_2Image, peteQ1_3Image, peteBlankConfusedImage, peteBlankTiredImage; // Pete's expression images
let peteEndImage, meowchiEndImage; // End screen images
let baristaSelectionBackground; // Background for barista selection screen
let baristaPeteImage, baristaMeowchiImage; // Barista selection images

// Image loading handling function
function loadGameImage(path, fallbackColor) {
  return loadImage(path,
    () => console.log(`${path} loaded successfully`),
    (err) => {
      console.error(`Failed to load ${path}:`, err);
      const img = createImage(400, 100);
      img.loadPixels();
      for (let i = 0; i < img.width; i++) {
        for (let j = 0; j < img.height; j++) {
          img.set(i, j, color(fallbackColor));
        }
      }
      img.updatePixels();
      return img;
    }
  );
}

function videoIsPlaying(video) {
  return video && 
         video.elt && 
         !video.elt.paused && 
         video.elt.currentTime > 0 && 
         !video.elt.ended;
}

function forcePlayVideo() {
  if (introVideo && introVideoLoaded && state === "intro") {
    // Using a user gesture to play video
    introVideo.loop();
    introVideo.volume(1);
    console.log('Forcing video play from user gesture');
  }
}

// Helper function to ensure consistent image dimensions
function getImagePlacement() {
  const bottomMargin = height * 0.02;
  const imgWidth = width * 0.48;
  const imgHeight = width * 0.30;
  const imgX = width * 0.02;
  const imgY = height - imgHeight - bottomMargin;
  return { x: imgX, y: imgY, width: imgWidth, height: imgHeight };
}

// Preload function to load all necessary assets
function preload() {
  try {
    // Load font
    pixellariFont = loadFont('Pixellari.ttf');

    // Load intro video
    try {
    introVideo = createVideo(['BG_introVID.mp4']);
      introVideo.hide(); // Hide the video element by default
      
      // Preload the video to ensure it's ready to play
      introVideo.elt.preload = "auto"; // Force preloading
      introVideo.elt.load(); // Start loading immediately
      
      // Set video attributes
      introVideo.elt.muted = false;
      introVideo.elt.playsinline = true;
      introVideo.elt.controls = false;
      
      // We'll use p5's built-in loop() method instead of a custom listener
      // as it's more reliable
      
      console.log('BG_introVID.mp4 loading started');
    } catch (e) {
      console.error('Failed to load BG_introVID.mp4:', e);
      introVideo = null;
    }

    backgroundMusic = loadSound('constant_audio.mp3', 
      () => console.log('Background music loaded successfully'), 
      (err) => console.error('Failed to load background music:', err));
    
    // Load barista selection background
    baristaSelectionBackground = loadGameImage('BG_baristas.png', [200, 200, 220]);
    
    // Load barista selection images
    baristaPeteImage = loadGameImage('B_barista.pete.png', [200, 180, 180]);
    baristaMeowchiImage = loadGameImage('B_barista.meowchi.png', [180, 180, 220]);
    
    // Load Mug background
    mugBackground = loadGameImage('BG_mug.png', [180, 200, 220]);
    
    // Load end screen images
    peteEndImage = loadGameImage('pete_end.png', [220, 180, 180]);
    meowchiEndImage = loadGameImage('meowchi_end.png', [180, 180, 220]);
    
    // Load Pete's background image
    peteBackground = loadGameImage('BG_pete.png', [220, 180, 140]);
    
    // Load Pete's dialogue images
    peteQ1Image = loadGameImage('P_Q1.png', [255, 200, 200]);
    peteQ1_2Image = loadGameImage('P_Q1.2.png', [255, 220, 200]); // Confused face
    peteQ1_3Image = loadGameImage('P_Q1.3.png', [255, 200, 180]); // Tired face
    peteBlankImage = loadGameImage('P_Blank.png', [200, 200, 255]);
    peteBlankConfusedImage = loadGameImage('P_Blank.confused.png', [220, 220, 255]); // Confused blank face
    peteBlankTiredImage = loadGameImage('P_Blank.tired.png', [230, 230, 255]); // Tired blank face
    peteQ3R2Image = loadGameImage('P_Q3.R2.png', [255, 150, 150]);
    peteQ3Image = loadGameImage('P_Q3.png', [200, 255, 200]);
    peteQ5_1Image = loadGameImage('P_Q5.1.png', [220, 200, 255]); // Confused face
    peteQ5_2Image = loadGameImage('P_Q5.2.png', [255, 150, 150]); // Angry face YOUR NAME?!!!
    peteQ6Image = loadGameImage('P_Q6.png', [200, 220, 255]); // Tired face with drink
    
    // Load Pete's video 
    try {
      peteQ4Video = createVideo('P_Q4.mp4');
      peteQ4Video.hide(); // Hide the video element by default
      
      // Preload the video to ensure it's ready to play
      peteQ4Video.elt.preload = "auto"; // Force preloading
      peteQ4Video.elt.load(); // Start loading immediately
      
      console.log('P_Q4.mp4 loading started');
    } catch (e) {
      console.error('Failed to load P_Q4.mp4:', e);
      // Create a placeholder for the video
      peteQ4Video = null;
    }
    
    // Load blank image for text input
    blankInputImage = loadGameImage('P_R4.Blank.png', [240, 240, 255]);
    checkmarkImage = loadGameImage('check.png', [100, 255, 100]);
    
    // Load response images
    const imageKeys = ['P_R1.1', 'R_NO', 'R_YES', 'P_R3.1', 'P_R3.2', 'P_R3.3', 'P_R4.2'];
    const fallbackColors = [
      [220, 220, 255], [255, 220, 220], [220, 255, 220], 
      [255, 220, 220], [220, 255, 220], [220, 220, 255], [200, 255, 255]
    ];
    
    // Load all response images
    for (let i = 0; i < imageKeys.length; i++) {
      responseImages[imageKeys[i]] = loadGameImage(`${imageKeys[i]}.png`, fallbackColors[i]);
    }
    
    // Add the blank response image to responseImages collection
    responseImages['P_R4.Blank'] = blankInputImage;
    
    // Load Meowchi's background image
    meowchiBackground = loadGameImage('BG_meowchi.png', [220, 180, 220]);
    
    // Load Meowchi's dialogue images - updated for new sequence
    meowchiQ1Image = loadGameImage('M_Q1.png', [255, 200, 255]); // [speaks in Meowish]
    meowchiQ2Image = loadGameImage('M_Q2.png', [255, 220, 220]); // meow meow me-meow meow? with normal face
    meowchiBlankConfusedImage = loadGameImage('M_Blank.confused.png', [240, 240, 255]); // Confused face for transition
    meowchiBlankImage = loadGameImage('M_Blank.png', [240, 240, 255]); // Regular blank image
    meowchiQ3Image = loadGameImage('M_Q3.png', [200, 255, 255]); // meow meow me-meow meow? with concerned face
    meowchiQ4_1Image = loadGameImage('M_Q4.1.png', [255, 200, 220]); // Que voulez-vous boire with concerned face
    meowchiQ4_2Image = loadGameImage('M_Q4.2.png', [255, 200, 220]); // Que voulez-vous boire (normal face)
    meowchiQ5Image = loadGameImage('M_Q5.png', [255, 200, 220]); // D'accord.. Voulez-vous un verre?
    meowchiQ5_1Image = loadGameImage('M_Q5.1.png', [220, 220, 255]); // Oh d'accord alors...
    meowchiQ5_2Image = loadGameImage('M_Q5.2.png', [255, 220, 220]); // Quelle boisson veux-tu?
    
    // Load Meowchi's blender video - preload it completely
    try {
      meowchiQ6Video = createVideo('M_Q6.mp4');
      meowchiQ6Video.hide(); // Hide the video element by default
      
      // Preload the video to ensure it's ready to play
      meowchiQ6Video.elt.preload = "auto"; // Force preloading
      meowchiQ6Video.elt.load(); // Start loading immediately
      
      console.log('M_Q6.mp4 loading started');
    } catch (e) {
      console.error('Failed to load M_Q6.mp4:', e);
      // Create a placeholder for the video
      meowchiQ6Video = null;
    }
    
    meowchiQ7_1Image = loadGameImage('M_Q7.1.png', [220, 255, 220]); // "Name"? hmmm
    meowchiQ7_2Image = loadGameImage('M_Q7.2.png', [255, 220, 255]); // ... votre nom?
    meowchiQ7_3Image = loadGameImage('M_Q7.3.png', [220, 220, 255]); // *name*, d'accord.
    meowchiQ8Image = loadGameImage('M_Q8.png', [200, 255, 200]); // Final drink message
    
    // Load Meowchi response images - updated for new sequence
    const meowchiImageKeys = [
      'M_R1.1', // Display Captions 
      'M_R2.1', 'M_R2.2', 'M_R2.3', // Huh, Meow, Subtitle Translation
      'M_R3.1', 'M_R3.2', 'M_R3.3', // French, English (not available), re-chose barista
      'M_R4.1', 'M_R4.2', // For here, A drink
      'M_R5.1', 'M_R5.2', 'M_R5.3', // Whisker Matcha, PURspresso, Catnip Tea
      'M_R6', 'M_YES', 'M_NO' // WHAT DID YOU SAY?, Yes, No
    ];
    
    const meowchiFallbackColors = [
      [255, 220, 255], // Display Captions
      [220, 255, 255], [255, 255, 220], [220, 255, 220], // Huh, Meow, Subtitle Translation
      [255, 220, 255], [220, 255, 255], [220, 220, 255], // French, English, re-chose barista
      [255, 220, 255], [220, 255, 255], // For here, A drink
      [255, 220, 220], [220, 255, 220], [220, 220, 255], // Whisker Matcha, PURspresso, Catnip Tea
      [255, 200, 200], [220, 255, 220], [255, 220, 220] // WHAT DID YOU SAY?, Yes, No
    ];
    
    // Load all Meowchi response images
    for (let i = 0; i < meowchiImageKeys.length; i++) {
      meowchiResponseImages[meowchiImageKeys[i]] = loadGameImage(
        `${meowchiImageKeys[i]}.png`, 
        meowchiFallbackColors[i]
      );
    }
    
    // Add the Meowchi blank response image (reuse Pete's for now)
    meowchiResponseImages['M_R6.Blank'] = blankInputImage;

    // AUDIO LOADING - Load Pete's and Meowchi's audio files
    try {
      // Load Pete's audio files with specified durations:
      // pete_default.mp3 - 1 second
      peteDefaultAudio = loadSound('pete_default.mp3', 
        () => console.log('pete_default.mp3 loaded'), 
        (err) => console.error('Failed to load pete_default.mp3:', err));
      
      // pete_confused.mp3 - 1 second
      peteConfusedAudio = loadSound('pete_confused.mp3',
        () => console.log('pete_confused.mp3 loaded'), 
        (err) => console.error('Failed to load pete_confused.mp3:', err));
      
      // pete_tired.mp3 - 2 seconds
      peteTiredAudio = loadSound('pete_tired.mp3',
        () => console.log('pete_tired.mp3 loaded'), 
        (err) => console.error('Failed to load pete_tired.mp3:', err));
      
      // pete_angry.mp3 - 1 second
      peteAngryAudio = loadSound('pete_angry.mp3',
        () => console.log('pete_angry.mp3 loaded'), 
        (err) => console.error('Failed to load pete_angry.mp3:', err));
      
      // Load Meowchi's audio files with specified durations:
      // meowchi_default.mp3 - 2 seconds
      meowchiDefaultAudio = loadSound('meowchi_default.mp3',
        () => console.log('meowchi_default.mp3 loaded'), 
        (err) => console.error('Failed to load meowchi_default.mp3:', err));
      
      // meowchi_confused.mp3 - 1 second
      meowchiConfusedAudio = loadSound('meowchi_confused.mp3',
        () => console.log('meowchi_confused.mp3 loaded'), 
        (err) => console.error('Failed to load meowchi_confused.mp3:', err));
      
      // meowchi_worried.mp3 - 3 seconds
      meowchiWorriedAudio = loadSound('meowchi_worried.mp3',
        () => console.log('meowchi_worried.mp3 loaded'), 
        (err) => console.error('Failed to load meowchi_worried.mp3:', err));
      
      // meowchi_kind.mp3 - 1 second
      meowchiKindAudio = loadSound('meowchi_kind.mp3',
        () => console.log('meowchi_kind.mp3 loaded'), 
        (err) => console.error('Failed to load meowchi_kind.mp3:', err));
    } catch (e) {
      console.error('Error loading audio files:', e);
    }
    
  } catch (e) {
    console.error('Error loading assets:', e);
  }
}

function videoLoaded() {
  console.log("Intro video loaded successfully");
  introVideoLoaded = true;
  
  // Try to autoplay immediately
  introVideo.loop();
  introVideo.volume(1);
}

// Handle mouse dragging for text selection
function mouseDragged() {
try {
  if (isTypingActive && dragStartPos !== -1) {
  // Set selection mode to active
  selectionInProgress = true;

  // Get text dimensions
  const optionFound = false;
  let textX = 0;
  let textY = 0;
  let optionWidth = 0;
  let textFontSize = 0;

  // Find the text input option to get its position
  for (let i = 0; i < responseOptions.length; i++) {
    if (responseOptions[i].startsWith("*make a type box")) {
      // We found the text input option, now calculate its position
      const blankImagePlacement = getImagePlacement();
      const maxOptionHeight = height * 0.18;
      const blankRightEdge = blankImagePlacement.x + blankImagePlacement.width;
      const remainingSpace = width - blankRightEdge;
      
      // Calculate option dimensions
      const originalWidth = responseImages['P_R4.Blank'].width;
      const originalHeight = responseImages['P_R4.Blank'].height;
      const imgHeight = Math.min(maxOptionHeight, height * 0.18);
      const imgWidth = (imgHeight / originalHeight) * originalWidth;
      
      // Calculate option position
      const optionSpacing = height * 0.02;
      const bottomMargin = optionSpacing;
      const startX = blankRightEdge + (remainingSpace / 2) - (imgWidth / 2);
      
      // Set text position values for calculations
      textX = startX + imgWidth * 0.15;
      optionWidth = imgWidth;
      textFontSize = imgHeight * 0.25;
      
      break;
    }
  }

  if (textX === 0) return; // If we didn't find the text input option
  // Calculate cursor position based on mouse position
  if (pixellariFont) {
    textFont(pixellariFont);
  }
  textSize(textFontSize);

  // Find cursor position at mouse point
  let newPosition = 0;

  // If mouse is before text area, set to start
  if (mouseX <= textX) {
    newPosition = 0;
  } 
  // If mouse is past text area, set to end
  else if (mouseX >= textX + textWidth(userInput)) {
    newPosition = userInput.length;
  }
  // Otherwise, find closest character
  else {
    for (let i = 0; i <= userInput.length; i++) {
      const currText = userInput.substring(0, i);
      const currWidth = textWidth(currText);
      
      if (mouseX < textX + currWidth) {
        // Choose the closer position
        newPosition = (mouseX - (textX + textWidth(userInput.substring(0, i-1))) < 
                     (textX + currWidth) - mouseX) 
          ? Math.max(0, i - 1) 
          : i;
        break;
      }
      
      // If we've reached the end, place cursor at the end
      if (i === userInput.length) {
        newPosition = userInput.length;
      }
    }
  }

  // Set cursor to new position
  cursorPosition = newPosition;

  // Update selection
  selectionMode = 'drag';
  selectionStart = Math.min(dragStartPos, newPosition);
  selectionEnd = Math.max(dragStartPos, newPosition);

  // Reset text settings
  textSize(height * 0.025);
  textFont('sans-serif');
}
} catch (e) {
  console.error('Error in mouseDragged:', e);
}
}

// Handle mouse release event
function mouseReleased() {
try {
  // If we were selecting text, finalize the selection
  if (isTypingActive && selectionInProgress) {
    selectionInProgress = false;

    // If start and end are the same, clear selection
    if (selectionStart === selectionEnd) {
      selectionMode = 'none';
      selectionStart = -1;
      selectionEnd = -1;
    }
  }

  // Reset drag start position
  dragStartPos = -1;
} catch (e) {
  console.error('Error in mouseReleased:', e);
}
}

// Handle key typed events for text input
function keyTyped() {
try {
  // Only handle typing when typing is active
  if (isTypingActive) {
    // Get the text width of the current input with the Pixellari font
    if (pixellariFont) {
      textFont(pixellariFont);
      textSize(height * 0.25); // Match the increased font size used in drawTextInputOnBlank
    }

    // If there's a selection, replace it
    if (selectionMode !== 'none') {
      // Delete selected text and insert new character
      userInput = userInput.substring(0, selectionStart) + key + userInput.substring(selectionEnd);
      cursorPosition = selectionStart + 1; // Move cursor after inserted character
      
      // Reset selection
      selectionMode = 'none';
      selectionStart = -1;
      selectionEnd = -1;
    } else {
      // Only check character count, not width, to ensure users can type all 10 characters
      if (userInput.length < maxCharacters) {
        // Insert character at cursor position
        userInput = userInput.substring(0, cursorPosition) + key + userInput.substring(cursorPosition);
        cursorPosition++; // Move cursor after inserted character
      }
    }

    // Reset the font to default
    textFont('sans-serif');

    return false; // Prevent default behavior
  }
  return true; // Allow default behavior
} catch (e) {
  console.error('Error in keyTyped:', e);
  return true;
}
}

function manageBackgroundMusic() {
  // Start music if it should be playing but isn't
  if (state !== "intro" && backgroundMusic && !backgroundMusic.isPlaying()) {
    backgroundMusic.setVolume(musicVolume);
    backgroundMusic.loop();
    console.log("Restarting background music");
  }
  
  // Stop music during intro state
  if (state === "intro" && backgroundMusic && backgroundMusic.isPlaying()) {
    backgroundMusic.stop();
    console.log("Stopping background music");
  }
}

// Handle complex key press events
function keyPressed() {
try {
  if (state === "intro" && keyCode === ENTER) {
    console.log("Enter key pressed, transitioning to selection");
    
    // Clean up video
    if (introVideo) {
      introVideo.stop();
    }

    if (backgroundMusic && !backgroundMusic.isPlaying()) {
      backgroundMusic.setVolume(musicVolume);
      backgroundMusic.loop();
      console.log("Starting background music");
    }
    
    // Force clean transition
    clear();
    
    // Set state first
    state = "selection";
    
    // Reset game variables
    showBlankImage = false;
    showOptions = false;
    selectedBarista = "";
    
    return false;
  }

  if (!isTypingActive) return true;

  // Handle Enter key for form submission when checkmark is visible
  if (keyCode === ENTER && checkmarkVisible) {
    yourName = userInput;
    userInput = "";
    isTypingActive = false;
    if (state === "pete") {
      handlePeteResponse("checkmark");
    } else if (state === "meowchi") {
      handleMeowchiResponse("checkmark");
    }
    return false;
  }

  // Handle backspace or delete with selection
  if (keyCode === BACKSPACE || keyCode === 46) { // BACKSPACE or DELETE
    if (selectionMode !== 'none') {
      // Delete selected text
      userInput = userInput.substring(0, selectionStart) + userInput.substring(selectionEnd);
      cursorPosition = selectionStart;
      
      // Reset selection
      selectionMode = 'none';
      selectionStart = -1;
      selectionEnd = -1;
      
      return false;
    }

    // Existing backspace/delete logic for no selection
    if (keyCode === BACKSPACE) {
      if (cursorPosition > 0) {
        userInput = userInput.substring(0, cursorPosition - 1) + userInput.substring(cursorPosition);
        cursorPosition--;
      }
      return false;
    }

    if (keyCode === 46) { // DELETE key
      if (cursorPosition < userInput.length) {
        userInput = userInput.substring(0, cursorPosition) + userInput.substring(cursorPosition + 1);
      }
      return false;
    }
  }

  // Handle left arrow (keyCode 37)
  if (keyCode === 37) { // LEFT_ARROW
    if (cursorPosition > 0) {
      cursorPosition--;
      
      // If shift is held, modify selection
      if (keyIsDown(SHIFT)) {
        if (selectionMode === 'none') {
          // Start a new selection
          selectionMode = 'drag';
          dragStartPos = cursorPosition + 1;
          selectionStart = cursorPosition;
          selectionEnd = dragStartPos;
        } else {
          // Update existing selection
          if (cursorPosition < dragStartPos) {
            selectionStart = cursorPosition;
            selectionEnd = dragStartPos;
          } else {
            selectionStart = dragStartPos;
            selectionEnd = cursorPosition;
          }
        }
      } else {
        // Reset selection on arrow key press without shift
        selectionMode = 'none';
        selectionStart = -1;
        selectionEnd = -1;
      }
    }
    return false;
  }

  // Handle right arrow (keyCode 39)
  if (keyCode === 39) { // RIGHT_ARROW
    if (cursorPosition < userInput.length) {
      cursorPosition++;
      
      // If shift is held, modify selection
      if (keyIsDown(SHIFT)) {
        if (selectionMode === 'none') {
          // Start a new selection
          selectionMode = 'drag';
          dragStartPos = cursorPosition - 1;
          selectionStart = dragStartPos;
          selectionEnd = cursorPosition;
        } else {
          // Update existing selection
          if (cursorPosition > dragStartPos) {
            selectionStart = dragStartPos;
            selectionEnd = cursorPosition;
          } else {
            selectionStart = cursorPosition;
            selectionEnd = dragStartPos;
          }
        }
      } else {
        // Reset selection on arrow key press without shift
        selectionMode = 'none';
        selectionStart = -1;
        selectionEnd = -1;
      }
    }
    return false;
  }

  // Handle Ctrl+A to select all (keyCode 65 is 'A')
  if (keyCode === 65 && keyIsDown(CONTROL)) {
    selectionMode = 'all';
    selectionStart = 0;
    selectionEnd = userInput.length;
    cursorPosition = userInput.length;
    return false;
  }

  // Handle home key (keyCode 36)
  if (keyCode === 36) { // HOME
    cursorPosition = 0;

    // If shift is held, modify selection
    if (keyIsDown(SHIFT)) {
      if (selectionMode === 'none') {
        selectionMode = 'drag';
        dragStartPos = userInput.length;
      }
      selectionStart = 0;
      selectionEnd = dragStartPos;
    } else {
      // Reset selection
      selectionMode = 'none';
      selectionStart = -1;
      selectionEnd = -1;
    }
    return false;
  }

  // Handle end key (keyCode 35)
  if (keyCode === 35) { // END
    cursorPosition = userInput.length;

    // If shift is held, modify selection
    if (keyIsDown(SHIFT)) {
      if (selectionMode === 'none') {
        selectionMode = 'drag';
        dragStartPos = 0;
      }
      selectionStart = dragStartPos;
      selectionEnd = userInput.length;
    } else {
      // Reset selection
      selectionMode = 'none';
      selectionStart = -1;
      selectionEnd = -1;
    }
    return false;
  }

  return true; // Allow default behavior for other keys
} catch (e) {
  console.error('Error in keyPressed:', e);
  return true;
}
}

// Start Pete's dialogue sequence
function startPeteDialogue() {
  console.log("Starting Pete dialogue sequence");
  showBlankImage = true;
  isTypingActive = false;
  userInput = "";
  cursorPosition = 0;
  cursorVisible = true;
  lastCursorBlink = millis();
  peteRepeatCount = 0; // Reset the repeat count when starting dialogue
  
  // Reset Pete's video state
  peteVideoPlaying = false;
  peteVideoFinished = false;

  // Reset selection
  selectionMode = 'none';
  selectionStart = -1;
  selectionEnd = -1;

  // AUDIO ADDITION - Reset audio state
  resetAudioForNewDialogue();
  audioPlayed = {};

  // Start with Q1 after a short delay
  setTimeout(() => {
    currentQuestion = "Can I take your order please?";
    responseOptions = ["P_R1.1"];
    showOptions = false;
    timerStarted = false;
    repeatCount = 0;
  }, 200);
}

// Handle Pete's dialogue responses
function handlePeteResponse(response) {
  showOptions = false;
  timerStarted = false;
  
  const previousQuestion = currentQuestion;

  // Dialogue flow handling using a state machine approach
  const dialogueMap = {
    "Can I take your order please?": {
      // First interaction with only one option
      oneOption: () => {
        peteOrderTime += 0.2;
        peteRepeatCount++; // Increment expression change counter
        currentQuestion = "Can I take your order please?";
        responseOptions = ["P_R1.1", "R_YES", "R_NO"];
      },
      // After showing multiple options
      "1": () => {
        repeatCount++;
        peteRepeatCount++; // Increment expression change counter
        
        if (repeatCount >= 2) {
          currentQuestion = "Okay then…NEXT CUSTOMER!";
          responseOptions = [];
          peteOrderTime = ORIGINAL_PETE_ORDER_TIME;
          repeatCount = 0;
          peteRepeatCount = 0; // Reset expression change counter
        } else {
          peteOrderTime += 0.2;
          currentQuestion = "Can I take your order please?";
        }
      },
      "2": () => {
        repeatCount = 0;
        peteRepeatCount = 0; // Reset expression change counter
        currentQuestion = "What can I get you?";
        responseOptions = ["P_R3.1", "P_R3.2", "P_R3.3"];
      },
      "3": () => {
        repeatCount = 0;
        peteRepeatCount = 0; // Reset expression change counter
        currentQuestion = "Okay then…NEXT CUSTOMER!";
        responseOptions = [];
        peteOrderTime = ORIGINAL_PETE_ORDER_TIME;
      }
    },
    "What can I get you?": {
      "1": () => {
        // Set up for video playback
        currentQuestion = "Ya! What ……..?";
        responseOptions = [
          "*make a type box",
          "P_R4.2"
        ];
        
        // Reset video state variables
        peteVideoPlaying = false;
        peteVideoFinished = false;
        window.peteVideoStartTime = null;
        window.peteBlankShown = false;
        window.peteResponseOptionsTimeoutSet = false;
        
        // Hide options until video finishes
        showOptions = false;
        
        // Pre-buffer the video if available
        if (peteQ4Video) {
          peteQ4Video.elt.load(); // Force reload
          peteQ4Video.elt.currentTime = 0; // Reset to beginning
        }
      },
      "2": () => {
        // Same setup for all drink options
        currentQuestion = "Ya! What ……..?";
        responseOptions = [
          "*make a type box",
          "P_R4.2"
        ];
        
        // Reset video state variables
        peteVideoPlaying = false;
        peteVideoFinished = false;
        window.peteVideoStartTime = null;
        window.peteBlankShown = false;
        window.peteResponseOptionsTimeoutSet = false;
        
        // Hide options until video finishes
        showOptions = false;
        
        // Pre-buffer the video if available
        if (peteQ4Video) {
          peteQ4Video.elt.load(); // Force reload
          peteQ4Video.elt.currentTime = 0; // Reset to beginning
        }
      },
      "3": () => {
        // Same setup for all drink options
        currentQuestion = "Ya! What ……..?";
        responseOptions = [
          "*make a type box",
          "P_R4.2"
        ];
        
        // Reset video state variables
        peteVideoPlaying = false;
        peteVideoFinished = false;
        window.peteVideoStartTime = null;
        window.peteBlankShown = false;
        window.peteResponseOptionsTimeoutSet = false;
        
        // Hide options until video finishes
        showOptions = false;
        
        // Pre-buffer the video if available
        if (peteQ4Video) {
          peteQ4Video.elt.load(); // Force reload
          peteQ4Video.elt.currentTime = 0; // Reset to beginning
        }
      },
      default: () => {
        // For any other response, use same setup
        currentQuestion = "Ya! What ……..?";
        responseOptions = [
          "*make a type box",
          "P_R4.2"
        ];
        
        // Reset video state variables
        peteVideoPlaying = false;
        peteVideoFinished = false;
        window.peteVideoStartTime = null;
        window.peteBlankShown = false;
        window.peteResponseOptionsTimeoutSet = false;
        
        // Hide options until video finishes
        showOptions = false;
      }
    },
    "Ya! What ……..?": {
      "checkmark": () => {
        // Save name and show confirmation (Q5.1)
        currentQuestion = `${yourName} ok then`;
        responseOptions = [];
        
        // After a short delay, transition to final drink delivery (Q6)
        setTimeout(() => {
          currentQuestion = `${yourName} here's your drink.`;
        }, 1500);
      },
      "repeat": () => {
        // If "I didn't catch that" is selected, show angry Pete (Q5.2)
        currentQuestion = "YOUR NAME?!!!";
        responseOptions = [
          "*make a type box"
        ];
        showBlankImage = true;
      },
      "textbox": () => {
        // This is now handled in mousePressed
        console.log("Activating text input");
        isTypingActive = true;
      }
    },
    "YOUR NAME?!!!": {
      "checkmark": () => {
        // After entering name in the angry Pete screen, go directly to final screen
        currentQuestion = `${yourName} here's your drink.`;
        responseOptions = [];
      },
      "textbox": () => {
        // This is now handled in mousePressed
        console.log("Activating text input");
        isTypingActive = true;
      }
    }
  };

  // Execute the appropriate dialogue flow
  if (dialogueMap[currentQuestion]) {
    if (responseOptions.length === 1 && dialogueMap[currentQuestion].oneOption) {
      dialogueMap[currentQuestion].oneOption();
    } else if (dialogueMap[currentQuestion][response]) {
      dialogueMap[currentQuestion][response]();
    } else if (dialogueMap[currentQuestion].default) {
      dialogueMap[currentQuestion].default();
    }
  }
  
  // AUDIO ADDITION - Reset audio if dialogue changed
  if (previousQuestion !== currentQuestion) {
    resetAudioForNewDialogue();
  }
}

// Handle Meowchi's dialogue responses - UPDATED FOR NEW SEQUENCE
function handleMeowchiResponse(response) {
  showOptions = false;
  timerStarted = true; // Keep timer active for Meowchi's responses
  
  const previousQuestion = currentQuestion;

  // Dialogue flow handling using a state machine approach
  const dialogueMap = {
    "[speaks in Meowish]": {
      "Display Captions": () => {
        currentQuestion = "meow meow me-meow meow?";
        responseOptions = ["Huh", "Meow", "Subtitle Translation"];
      }
    },
    
    "meow meow me-meow meow?": {
      "Huh": () => {
        // Path 1: Q3.1 - Show confused face for 1 second, then continue with concerned face
        meowishSequenceActive = true;
        displayTimer = millis(); // Reset timer for the confused face transition
        
        // Force play the confused audio right away
        resetAudioForNewDialogue();
        setTimeout(() => {
          playAudioForState("meowchi", "meow meow me-meow meow?");
        }, 50);
        
        // Change the image after 1 second
        setTimeout(() => {
          // Replace the current question with the concerned face version
          currentQuestion = "concerned_meow"; // Using a special key for the concerned face state
          
          // Set responses to show after the confused face
          responseOptions = ["Subtitle Translation", "re-chose barista"];
          showOptions = true;
          
          // Force play audio for this new state
          resetAudioForNewDialogue();
          setTimeout(() => {
            playAudioForState("meowchi", "concerned_meow");
          }, 50);
        }, 1000);
      },
      "Meow": () => {
        // Same behavior as "Huh" - follows Path 1
        meowishSequenceActive = true;
        displayTimer = millis(); // Reset timer for the confused face transition
        
        // Change the image after 1 second
        setTimeout(() => {
          // Replace the current question with the concerned face version
          currentQuestion = "concerned_meow"; // Using a special key for the concerned face state
          
          // Set responses to show after the confused face
          responseOptions = ["Subtitle Translation", "re-chose barista"];
          showOptions = true;
        }, 1000);
      },
      "Subtitle Translation": () => {
        // Path 2: Q3.2 - Keep displaying the same question, but offer language options
        // We keep the current question but change the response options
        responseOptions = ["French", "English"];
      }
    },
    
    "concerned_meow": {
  // Path 1 continues: R3.1 options
  "Subtitle Translation": () => {
    // Currently jumps straight to concerned_french
    // Should instead show language options like in the original path
    responseOptions = ["French", "English"];
    // Keep showing the same concerned meow face
    showOptions = true;
  },
  "re-chose barista": () => {
    state = "selection";
  },
  "French": () => {
    // When French is selected from the concerned face
    currentQuestion = "concerned_french"; // Using a special key for the French with concerned face
    responseOptions = ["For here", "A drink"];
  }
},
    
    "French": () => {
      // Path 2 continues: Q4.2 - From normal face after selecting Subtitle Translation -> French
      currentQuestion = "normal_french"; // Using a special key for the regular French face
      responseOptions = ["For here", "A drink"];
    },
    
    "English": () => {
      // English is not available, do nothing (keep current options)
      showOptions = true;
    },
    
    // Both paths converge at R4 but with different question images displayed
    // Both paths now branch again after R4
    "concerned_french": {
      "1": () => { // For here - Path 1.A
        currentQuestion = "D'accord.. Vous etes pret?"; // Q5.1
        responseOptions = ["Yes", "No"];
      },
      "2": () => { // A drink - Path 1.B
        // Skip Q5.1 and R5, go directly to Q6.2
        currentQuestion = "Quelle boisson veux-tu?"; // Q6.2
        responseOptions = ["Whisker Matcha", "PURspresso", "Catnip Tea"];
      }
    },
    
    "normal_french": {
      "1": () => { // For here - Path 2.A
        currentQuestion = "D'accord.. Vous etes pret?"; // Q5.1
        responseOptions = ["Yes", "No"];
      },
      "2": () => { // A drink - Path 2.B
        // Skip Q5.1 and R5, go directly to Q6.2
        currentQuestion = "Quelle boisson veux-tu?"; // Q6.2
        responseOptions = ["Whisker Matcha", "PURspresso", "Catnip Tea"];
      }
    },
    
    "D'accord.. Vous etes pret?": { // Q5.1 with R5 options
      "yes": () => { // If Yes (option 1) selected in R5, go to Q6.2
        currentQuestion = "Quelle boisson veux-tu?";
        responseOptions = ["Whisker Matcha", "PURspresso", "Catnip Tea"];
      },
      "no": () => { // If No (option 2) selected in R5, go to Q6.1
        currentQuestion = "Oh d'accord alors…"; // This is Q6.1
        responseOptions = [];
        
        // Create a special flag to track the "Oh d'accord alors…" display time
        meowchiExitDelay = true;
        displayTimer = millis(); // Reset the timer for this specific message
        
        // After 3 seconds, return to barista selection (handled in draw function)
      }
    },
    
    "Quelle boisson veux-tu?": {
      "1": () => { // Whisker Matcha
        // Play the blender video (Q7) - Handled in draw function
        currentQuestion = "Compris. Puis-je avoir ton n-BLENDERRRR";
        responseOptions = [
          "*make a type box",
          "WHAT DID YOU SAY?"
        ];
        
        // Reset video state for playback
        meowchiVideoPlaying = false;
        meowchiVideoFinished = false;
        window.videoStartTime = null; // Reset timestamp for video
        window.blankShown = false; // Reset blank shown flag
        window.responseOptionsTimeoutSet = false; // Reset response timeout flag
        
        // Make sure options are hidden until video finishes
        showOptions = false;
        displayTimer = millis(); // Reset timer
        
        // Pre-buffer the video if available to ensure immediate playback
        if (meowchiQ6Video) {
          meowchiQ6Video.elt.load(); // Force reload
          meowchiQ6Video.elt.currentTime = 0; // Reset to beginning
        }
      },
      "2": () => { // PURspresso
        // Play the blender video (Q7) - Same as path 1
        currentQuestion = "Compris. Puis-je avoir ton n-BLENDERRRR";
        responseOptions = [
          "*make a type box",
          "WHAT DID YOU SAY?"
        ];
        
        // Reset video state for playback
        meowchiVideoPlaying = false;
        meowchiVideoFinished = false;
        window.videoStartTime = null; // Reset timestamp for video
        window.blankShown = false; // Reset blank shown flag
        window.responseOptionsTimeoutSet = false; // Reset response timeout flag
        
        // Make sure options are hidden until video finishes
        showOptions = false;
        displayTimer = millis(); // Reset timer
        
        // Pre-buffer the video if available to ensure immediate playback
        if (meowchiQ6Video) {
          meowchiQ6Video.elt.load(); // Force reload
          meowchiQ6Video.elt.currentTime = 0; // Reset to beginning
        }
      },
      "3": () => { // Catnip Tea
        // Play the blender video (Q7) - Same as path 1
        currentQuestion = "Compris. Puis-je avoir ton n-BLENDERRRR";
        responseOptions = [
          "*make a type box",
          "WHAT DID YOU SAY?"
        ];
        
        // Reset video state for playback
        meowchiVideoPlaying = false;
        meowchiVideoFinished = false;
        window.videoStartTime = null; // Reset timestamp for video
        window.blankShown = false; // Reset blank shown flag
        window.responseOptionsTimeoutSet = false; // Reset response timeout flag
        
        // Make sure options are hidden until video finishes
        showOptions = false;
        displayTimer = millis(); // Reset timer
        
        // Pre-buffer the video if available to ensure immediate playback
        if (meowchiQ6Video) {
          meowchiQ6Video.elt.load(); // Force reload
          meowchiQ6Video.elt.currentTime = 0; // Reset to beginning
        }
      }
    },
    
    "Compris. Puis-je avoir ton n-BLENDERRRR": {
      "textbox": () => {
        // This is handled in mousePressed
        console.log("Activating text input");
        isTypingActive = true;
      },
      "what": () => {
        // Path 2: User selects "WHAT DID YOU SAY?" (option 2 in R7)
        currentQuestion = "… votre nom?"; // Q8.2
        responseOptions = [
          "*make a type box"
        ];
      },
      "checkmark": () => {
        // Path 1: User entered name directly after blender sound (option 1 in R7)
        // Save name and show confirmation (Q8.1)
        currentQuestion = "MEOWCHI_Q7_1"; // "Name"? Hmmm
        responseOptions = [];
        
        // After a short delay, transition to final drink message (Q9.2)
        setTimeout(() => {
          currentQuestion = "MEOWCHI_Q8"; // Final drink message
          
          // After 4 seconds, transition to the meowchi_end screen
          setTimeout(() => {
            state = "meowchi_end";
            currentQuestion = "";
            responseOptions = [];
          }, 4000);
        }, 2000);
      }
    },
    
    "… votre nom?": {
      "textbox": () => {
        // This is handled in mousePressed
        console.log("Activating text input");
        isTypingActive = true;
      },
      "checkmark": () => {
        // Path 2 continues: User entered name after "... votre nom?" (R8)
        // Save name and show confirmation (Q9.1)
        currentQuestion = "MEOWCHI_Q7_3"; // "*name*, d'accord."
        responseOptions = [];
        
        // After a short delay, transition to final drink delivery (Q9.2)
        setTimeout(() => {
          currentQuestion = "MEOWCHI_Q8"; // Final drink message
          
          // After 4 seconds, return to mug
          setTimeout(() => {
            state = "meowchi_end";
            currentQuestion = "";
            responseOptions = [];
          }, 4000);
        }, 2000);
      }
    }
  };
  
  // Execute the appropriate dialogue flow
  if (dialogueMap[currentQuestion] && dialogueMap[currentQuestion][response]) {
    dialogueMap[currentQuestion][response]();
  } else if (typeof dialogueMap[response] === 'function') {
    dialogueMap[response]();
  }
  
  // AUDIO ADDITION - Reset audio if dialogue changed
  if (previousQuestion !== currentQuestion) {
    resetAudioForNewDialogue();
  }
  setTimeout(() => {
    playAudioForState("meowchi", currentQuestion);
  }, 50);
}

// Start Meowchi's dialogue sequence - UPDATED FOR NEW SEQUENCE
function startMeowchiDialogue() {
  console.log("Starting Meowchi dialogue sequence");
  showBlankImage = true;
  isTypingActive = false;
  userInput = "";
  cursorPosition = 0;
  cursorVisible = true;
  lastCursorBlink = millis();
  meowishSequenceActive = false;
  
  // Reset video state
  meowchiVideoPlaying = false;
  meowchiVideoFinished = false;

  // Reset selection
  selectionMode = 'none';
  selectionStart = -1;
  selectionEnd = -1;

  // AUDIO ADDITION - Reset audio state
  resetAudioForNewDialogue();
  audioPlayed = {};

  // Start with Q1 (new sequence) after a short delay
  setTimeout(() => {
    currentQuestion = "[speaks in Meowish]";
    responseOptions = ["Display Captions"];
    showOptions = false;
    timerStarted = false;
    displayTimer = 0; // Reset display timer to ensure proper timing
  }, 200);
}

// Setup function to initialize the canvas and game settings
function setup() {
  try {
    // Calculate canvas dimensions with correct aspect ratio
    const targetWidth = 1280;
    const aspectRatio = 16/9;
    createCanvas(targetWidth, targetWidth / aspectRatio);
    textAlign(CENTER, CENTER);
    textSize(height * 0.02);
    
    window.lastState = "intro";

    // Set state to "intro" instead of "selection"
    state = "intro";

    if (introVideo) {
      // Don't start playing yet - wait for user interaction first
      // because many browsers block autoplay
      introVideoPlaying = true;
      
      // Add an event listener to mark when the video is ready to play
      introVideo.elt.addEventListener('canplay', function() {
        introVideoLoaded = true;
        console.log('Intro video can play now');
      });
      
      // Add direct event listeners to the document for better interaction capture
      document.addEventListener('click', forcePlayVideo);
      document.addEventListener('touchstart', forcePlayVideo);
    }

    // Use default font as fallback if Pixellari doesn't load properly
    if (!pixellariFont) {
      console.warn("Pixellari font not loaded, using default font instead");
    }
    
    // Set up the video completion callbacks
    if (meowchiQ6Video) {
      // Add event listener for video completion
      meowchiQ6Video.elt.addEventListener('ended', videoEnded);
      
      // Configure video for best performance
      meowchiQ6Video.elt.preload = "auto"; // Force full preload
      meowchiQ6Video.hide(); // Initially hide the video element
      
      // Start preloading the video
      meowchiQ6Video.elt.load();
    }
    
    // Set up Pete's video completion callback
    if (peteQ4Video) {
      // Add event listener for video completion
      peteQ4Video.elt.addEventListener('ended', peteVideoEnded);
      
      // Configure video for best performance
      peteQ4Video.elt.preload = "auto"; // Force full preload
      peteQ4Video.hide(); // Initially hide the video element
      
      // Start preloading the video
      peteQ4Video.elt.load();
    }
    
    // Initialize the video state variables
    window.videoStartTime = null;
    window.blankShown = false;
    window.responseOptionsTimeoutSet = false;
    
    // Initialize Pete's video state variables
    window.peteVideoStartTime = null;
    window.peteBlankShown = false;
    window.peteResponseOptionsTimeoutSet = false;
    
    // AUDIO SETUP - Initialize audio playback
    audioPlayed = {};
    
    // Configure audio to enable on user interaction
    if (typeof getAudioContext === 'function') {
      document.addEventListener('click', function() {
        getAudioContext().resume();
      });
    }
    
  } catch (e) {
    console.error('Error in setup:', e);
  }
}

function rebuildBaristaSelection() {
  if (baristaSelectionBackground) {
    // Force reload the image
    baristaSelectionBackground.resize(0, 0);
  }
  if (baristaPeteImage) {
    baristaPeteImage.resize(0, 0);
  }
  if (baristaMeowchiImage) {
    baristaMeowchiImage.resize(0, 0);
  }
  console.log("Barista selection elements reinitialized");
}

function drawIntroScreen() {
  // Check if video element exists
  if (introVideo) {
    image(introVideo, 0, 0, width, height);
    
    // No need for any prompts since the video already has "press enter to start"
    
    // Simple error handling - if video isn't playing attempt to play it
    if (frameCount % 60 === 0) { // Try every ~1 second
      if (introVideo.elt.paused) {
        introVideo.loop();
        introVideo.volume(1);
      }
    }
  } else {
    // Fallback if video object doesn't exist at all
    background(30);
    fill(255);
    textSize(height * 0.05);
    text("Coffee Shop", width/2, height * 0.4);
    
    textSize(height * 0.04);
    text("Press ENTER to start", width/2, height * 0.6);
    
    textSize(height * 0.02); // Reset text size
  }
}

// function playAudioForState(state, question) {
//   try {
//     // Don't play audio for video states (they have their own audio)
//     if (question === "Ya! What ……..?" || question === "Compris. Puis-je avoir ton n-BLENDERRRR") {
//       return;
//     }
    
//     // Generate a unique key for this dialogue state
//     // const dialogueKey = `${state}_${question}`;
//     const dialogueKey = state === "pete" ? 
//     `${state}_${question}_${peteRepeatCount}` : 
//     `${state}_${question}`;
  
    
//     // Skip if we've already played audio for this state
//     if (audioPlayed[dialogueKey]) {
//       return;
//     }
    
//     // Stop any currently playing audio
//     if (currentAudio && currentAudio.isPlaying()) {
//       currentAudio.stop();
//     }
    
//     let audioToPlay = null;
    
//     // Determine which audio to play based on Pete's dialogue states
//     if (state === "pete") {
//       if (question === "Can I take your order please?") {
//         // Different audio based on repeat count
//         if (peteRepeatCount === 0) {
//           audioToPlay = peteDefaultAudio; // Q1: Normal face
//         } else if (peteRepeatCount === 1) {
//           audioToPlay = peteConfusedAudio; // Q2: Confused face
//         } else {
//           audioToPlay = peteTiredAudio; // Q3.1: Tired face
//         }
//       } 
//     else if (question === "Okay then…NEXT CUSTOMER!") {
//       audioToPlay = peteAngryAudio; // Q3.R2
//     }
//     else if (question === "What can I get you?") {
//       audioToPlay = peteDefaultAudio; // Q3.2
//     }
//     else if (question.includes("ok then") && !question.includes("here's your drink")) {
//       audioToPlay = peteConfusedAudio; // Q5.1
//     }
//     else if (question === "YOUR NAME?!!!") {
//       audioToPlay = peteAngryAudio; // Q5.2
//     }
//     else if (question.includes("here's your drink")) {
//       audioToPlay = peteTiredAudio; // Q6
//     }
//   }
//   // Determine which audio to play based on Meowchi's dialogue states
//   else if (state === "meowchi") {
//     if (question === "[speaks in Meowish]") {
//       audioToPlay = meowchiDefaultAudio; // Q1
//     }
//     else if (question === "meow meow me-meow meow?" && !meowishSequenceActive) {
//       audioToPlay = meowchiDefaultAudio; // Q2: Normal face
//     }
//     else if (question === "concerned_meow" || 
//             (question === "meow meow me-meow meow?" && meowishSequenceActive)) {
//       audioToPlay = meowchiConfusedAudio; // Q3.1: Concerned face
//     }
//     else if (question === "concerned_french") {
//       audioToPlay = meowchiWorriedAudio; // Q4.1: With concerned face
//     }
//     else if (question === "normal_french") {
//       audioToPlay = meowchiDefaultAudio; // Q4.2: With normal face
//     }
//     else if (question === "D'accord.. Vous etes pret?") {
//       audioToPlay = meowchiWorriedAudio; // Q5
//     }
//     else if (question === "Oh d'accord alors…") {
//       audioToPlay = meowchiWorriedAudio; // Q6.1
//     }
//     else if (question === "Quelle boisson veux-tu?") {
//       audioToPlay = meowchiDefaultAudio; // Q6.2
//     }
//     else if (question === "MEOWCHI_Q7_1") { // "[Name]?" hmmm
//       audioToPlay = meowchiConfusedAudio; // Q8.1
//     }
//     else if (question === "… votre nom?") {
//       audioToPlay = meowchiWorriedAudio; // Q8.2
//     }
//     else if (question === "MEOWCHI_Q7_3") { // "[Name], d'accord"
//       audioToPlay = meowchiWorriedAudio; // Q9.1
//     }
//     else if (question === "MEOWCHI_Q8") { // Final drink message
//       audioToPlay = meowchiKindAudio; // Q9.2
//     }
//   }
  
//   // Play the selected audio
//   if (audioToPlay) {
//     currentAudio = audioToPlay;
//     audioToPlay.play();
//     audioPlayed[dialogueKey] = true;
//     console.log(`Playing audio for: ${state} - ${question}`);
//   }
//   } catch (e) {
//     console.error('Error playing audio:', e);
//   }
// }

// AUDIO FUNCTION - Reset audio state when dialogue changes

// AUDIO FUNCTION - Function to play audio based on the current dialogue state
function playAudioForState(state, question) {
  try {
    // Don't play audio for video states (they have their own audio)
    if (question === "Ya! What ……..?" || question === "Compris. Puis-je avoir ton n-BLENDERRRR") {
      return;
    }
    
    // Generate a unique key for this dialogue state
    // Include peteRepeatCount for Pete to differentiate between facial expressions
    const dialogueKey = state === "pete" ? 
      `${state}_${question}_${peteRepeatCount}` : 
      `${state}_${question}`;
    
    // Skip if we've already played audio for this state
    if (audioPlayed[dialogueKey]) {
      return;
    }
    
    // Stop any currently playing audio
    if (currentAudio && currentAudio.isPlaying()) {
      currentAudio.stop();
    }
    
    let audioToPlay = null;
    
    // Determine which audio to play based on Pete's dialogue states
    if (state === "pete") {
      if (question === "Can I take your order please?") {
        // Now directly use peteRepeatCount to determine the audio
        if (peteRepeatCount === 0) {
          audioToPlay = peteDefaultAudio; // Q1: Normal face
          console.log("Playing pete_default at Q1");
        } else if (peteRepeatCount === 1) {
          audioToPlay = peteConfusedAudio; // Q2: Confused face
          console.log("Playing pete_confused at Q2");
        } else if (peteRepeatCount >= 2) {
          audioToPlay = peteTiredAudio; // Q3.1: Tired face
          console.log("Playing pete_tired at Q3.1");
        }
      } 
      else if (question === "Okay then…NEXT CUSTOMER!") {
        audioToPlay = peteAngryAudio; // Q3.R2
      }
      else if (question === "What can I get you?") {
        audioToPlay = peteDefaultAudio; // Q3.2
      }
      else if (question.includes("ok then") && !question.includes("here's your drink")) {
        audioToPlay = peteConfusedAudio; // Q5.1
      }
      else if (question === "YOUR NAME?!!!") {
        audioToPlay = peteAngryAudio; // Q5.2
      }
      else if (question.includes("here's your drink")) {
        audioToPlay = peteTiredAudio; // Q6
      }
    }
    // Meowchi's audio states - fixed according to requirements
    else if (state === "meowchi") {
      if (question === "[speaks in Meowish]") {
        audioToPlay = meowchiDefaultAudio; // Q1
      }
      else if (question === "meow meow me-meow meow?" && !meowishSequenceActive) {
        audioToPlay = meowchiDefaultAudio; // Q2: Normal face
      }
      else if (question === "concerned_meow" || 
               (question === "meow meow me-meow meow?" && meowishSequenceActive)) {
        audioToPlay = meowchiConfusedAudio; // Q3.1: Concerned face
      }
      else if (question === "concerned_french") {
        audioToPlay = meowchiWorriedAudio; // Q4.1: With concerned face
      }
      else if (question === "normal_french") {
        audioToPlay = meowchiDefaultAudio; // Q4.2: With normal face
      }
      else if (question === "D'accord.. Vous etes pret?") {
        audioToPlay = meowchiWorriedAudio; // Q5
      }
      else if (question === "Oh d'accord alors…") {
        audioToPlay = meowchiWorriedAudio; // Q6.1
      }
      else if (question === "Quelle boisson veux-tu?") {
        audioToPlay = meowchiDefaultAudio; // Q6.2
      }
      else if (question === "MEOWCHI_Q7_1") { // "[Name]?" hmmm
        audioToPlay = meowchiConfusedAudio; // Q8.1
      }
      else if (question === "… votre nom?") {
        audioToPlay = meowchiWorriedAudio; // Q8.2
      }
      else if (question === "MEOWCHI_Q7_3") { // "[Name], d'accord"
        audioToPlay = meowchiWorriedAudio; // Q9.1
      }
      else if (question === "MEOWCHI_Q8") { // Final drink message
        audioToPlay = meowchiKindAudio; // Q9.2
      }
    }
    
    // Play the selected audio
    if (audioToPlay) {
      currentAudio = audioToPlay;
      audioToPlay.play();
      audioPlayed[dialogueKey] = true;
      console.log(`Playing audio for: ${state} - ${question}`);
    }
  } catch (e) {
    console.error('Error playing audio:', e);
  }
}
function resetAudioForNewDialogue() {
  try {
    // Stop any currently playing audio
    if (currentAudio && currentAudio.isPlaying()) {
      currentAudio.stop();
      currentAudio = null;
    }
  } catch (e) {
    console.error('Error resetting audio:', e);
  }
}

// Callback function when Meowchi's video ends
function videoEnded() {
  console.log("Video playback complete");
  meowchiVideoPlaying = false;
  meowchiVideoFinished = true;
  
  // Hide the video element
  if (meowchiQ6Video) {
    meowchiQ6Video.stop();
    meowchiQ6Video.hide();
  }
  
  // Show the blank image after video completes
  if (currentQuestion === "Compris. Puis-je avoir ton n-BLENDERRRR") {
    showOptions = true; // Show response options after video ends
  }
}

// Callback function when Pete's video ends
function peteVideoEnded() {
  console.log("Pete video playback complete");
  peteVideoPlaying = false;
  peteVideoFinished = true;
  
  // Hide the video element
  if (peteQ4Video) {
    peteQ4Video.stop();
    peteQ4Video.hide();
  }
  
  // Show response options after video ends
  if (currentQuestion === "Ya! What ……..?") {
    showOptions = true; // Show response options after video ends
  }
}

// Main draw function to render different game states
function draw() {
  try {
    manageBackgroundMusic();

    // Only use default background for states other than pete, meowchi, and mug
    if (state !== "pete" && state !== "meowchi" && state !== "mug" && 
        state !== "pete_end" && state !== "meowchi_end" && state !== "intro") {
      background(220);
    }
    
    
    switch(state) {
      case "intro":
        drawIntroScreen();
        break;
      case "selection":
        drawBaristaSelection();
        showBlankImage = false;
        break;
      case "pete":
        drawPeteScene();
        break;
      case "meowchi":
        drawMeowchiDialogue();
        break;
      case "mug":
        drawMug();
        showBlankImage = false;
        break;
      case "pete_end":
        drawPeteEnd();
        break;
      case "meowchi_end":
        drawMeowchiEnd();
        break;
      default:
        state = "intro"; // Change default to intro instead of selection
        showBlankImage = false;
        break;
    }
  } catch (e) {
    console.error('Error in draw:', e);
    background(255, 0, 0);
    fill(255);
    text('An error occurred. Please check console.', width/2, height/2);
  }
}

// Draw Pete's end screen
function drawPeteEnd() {
  if (peteEndImage) {
    image(peteEndImage, 0, 0, width, height);
  } else {
    // Fallback if image doesn't load
    background(220, 190, 180);
    text("Pete's ending", width/2, height/2);
  }
}

// Draw Meowchi's end screen
function drawMeowchiEnd() {
  if (meowchiEndImage) {
    image(meowchiEndImage, 0, 0, width, height);
  } else {
    // Fallback if image doesn't load
    background(190, 200, 220);
    text("Meowchi's ending", width/2, height/2);
  }
}
function drawBaristaSelection() {
  console.log("Drawing barista selection screen");
  
  // Force clear the canvas
  clear();
  background(240);
  
  // Use the barista selection background image
  if (baristaSelectionBackground) {
    // Force redraw of the image
    image(baristaSelectionBackground, 0, 0, width, height);
  }
  
  // Make sure baristaPeteImage and baristaMeowchiImage are properly drawn
  if (baristaPeteImage && baristaMeowchiImage) {
    const imageHeight = height * 0.15;
    const peteWidth = (imageHeight / baristaPeteImage.height) * baristaPeteImage.width;
    const meowchiWidth = (imageHeight / baristaMeowchiImage.height) * baristaMeowchiImage.width;
    
    const spacing = width * 0.05;
    const totalWidth = peteWidth + meowchiWidth + spacing;
    const startX = (width - totalWidth) / 2;
    const startY = height * 0.85 - imageHeight;
    
    // Draw barista images
    image(baristaPeteImage, startX, startY, peteWidth, imageHeight);
    image(baristaMeowchiImage, startX + peteWidth + spacing, startY, meowchiWidth, imageHeight);
  } else {
    // Fallback if images fail to load
    fill(220);
    textSize(width / 30);
    text("Order with Pete", width/4, height * 0.9);
    text("Order with Meowchi", 3*width/4, height * 0.9);
  }
}

// Draw the Pete dialogue scene
function drawPeteScene() {
  // When showing final dialogue, use mug background
  if (currentQuestion && currentQuestion.includes("here's your drink")) {
    // Draw the mug background for the final dialogue
    if (mugBackground) {
      image(mugBackground, 0, 0, width, height);
    }
  } else {
    // For all other dialogue, use Pete's background
    if (peteBackground) {
      image(peteBackground, 0, 0, width, height);
    }
  }
  
  // Handle image selection: blank background or dialogue
  if (showBlankImage) {
    const placement = getImagePlacement();
    // Choose the appropriate blank image based on repeat count
    if (currentQuestion === "Can I take your order please?") {
      if (peteRepeatCount === 1) {
        image(peteBlankConfusedImage, placement.x, placement.y, placement.width, placement.height);
      } else if (peteRepeatCount >= 2) {
        image(peteBlankTiredImage, placement.x, placement.y, placement.width, placement.height);
      } else {
        image(peteBlankImage, placement.x, placement.y, placement.width, placement.height);
      }
    } else {
      image(peteBlankImage, placement.x, placement.y, placement.width, placement.height);
    }
  }
  drawPeteDialogue();
}

// Render Pete's dialogue and manage dialogue progression
function drawPeteDialogue() {
  if (currentQuestion && !showOptions) {
    if (!timerStarted) {
      displayTimer = millis();
      timerStarted = true;
      
      // AUDIO ADDITION - Play audio when first showing the question
      playAudioForState("pete", currentQuestion);
    }

    // Handle special case for Pete's video playback
    if (currentQuestion === "Ya! What ……..?" && !peteVideoFinished) {
      const placement = getImagePlacement();
      
      // Sequence: Show blank image, then immediately start video
      if (!window.peteBlankShown && !peteVideoPlaying && !peteVideoFinished) {
        // Display blank image first
        image(peteBlankImage, placement.x, placement.y, placement.width, placement.height);
        
        // Mark that we've shown the blank image
        window.peteBlankShown = true;
        
        // Start the video immediately
        if (peteQ4Video) {
          // Make sure video is ready before playing
          if (peteQ4Video.elt.readyState >= 2) { // HAVE_CURRENT_DATA or better
            console.log("Pete's video ready, starting playback immediately");
            window.peteVideoStartTime = millis();
            peteQ4Video.loop(false); // Play once
            peteQ4Video.volume(1);
            peteVideoPlaying = true;
          } else {
            // If video isn't ready yet, wait for it
            console.log("Pete's video not ready yet, waiting...");
            peteQ4Video.elt.addEventListener('canplay', function peteVideoCanPlayHandler() {
              console.log("Pete's video can play now, starting playback");
              window.peteVideoStartTime = millis();
              peteQ4Video.loop(false);
              peteQ4Video.volume(1);
              peteVideoPlaying = true;
              // Remove event listener to prevent multiple calls
              peteQ4Video.elt.removeEventListener('canplay', peteVideoCanPlayHandler);
            });
          }
        }
      }
      // During video playback
      else if (peteVideoPlaying && peteQ4Video) {
        // Display video while it's playing - FILL THE ENTIRE CANVAS
        image(peteQ4Video, 0, 0, width, height);
        
        // Check if video has been playing for more than 6 seconds (video duration)
        // This is a backup in case the onended callback doesn't fire
        if (window.peteVideoStartTime && (millis() - window.peteVideoStartTime > 6000)) {
          console.log("Pete's video timeout reached - ending video");
          peteVideoPlaying = false;
          peteVideoFinished = true;
          
          // Stop and hide the video
          peteQ4Video.stop();
          peteQ4Video.hide();
          
          // Reset timestamp
          window.peteVideoStartTime = null;
        }
      }
      // After video completes
      else if (peteVideoFinished) {
        // After video ends, show blank image until response is made
        image(peteBlankImage, placement.x, placement.y, placement.width, placement.height);
        
        // Show response options after video finishes
        if (!showOptions) {
          showOptions = true;
        }
      }
      // If video failed to load
      else if (!peteQ4Video) {
        // Show the blank image with no video
        image(peteBlankImage, placement.x, placement.y, placement.width, placement.height);
        
        // Show response options after a delay
        if (!showOptions && !window.peteResponseOptionsTimeoutSet) {
          window.peteResponseOptionsTimeoutSet = true;
          setTimeout(() => {
            showOptions = true;
          }, 6000); // Show options after 6 seconds (simulating video length)
        }
      }
    }
    else {
      // Map questions to images and draw appropriately
      // Use different images for Pete based on repeat count
      let questionImage;
      if (currentQuestion === "Can I take your order please?") {
        // Select the right image based on repeat count
        if (peteRepeatCount === 0) {
          questionImage = peteQ1Image;
        } else if (peteRepeatCount === 1) {
          questionImage = peteQ1_2Image;
        } else {
          questionImage = peteQ1_3Image;
        }
      } else {
        // For other questions, use the original mapping
        const questionImageMap = {
          "Okay then…NEXT CUSTOMER!": peteQ3R2Image,
          "What can I get you?": peteQ3Image,
          "Ya! What ……..?": peteBlankImage, // Using blank image for when video finished
          "YOUR NAME?!!!": peteQ5_2Image,
          "here's your drink.": peteQ6Image
        };
        questionImage = questionImageMap[currentQuestion];
      }
      
      // Handle special case for name confirmation (Q5.1)
      if (currentQuestion.includes("ok then") && !currentQuestion.includes("here's your drink")) {
        const placement = getImagePlacement();
        image(peteQ5_1Image, placement.x, placement.y, placement.width, placement.height);
        
        // Display the entered name on top of the image in green with a question mark in black
        if (pixellariFont) {
          textFont(pixellariFont);
        }
        
        // Adjust text size to exactly 27% of option height
        const maxOptionHeight = height * 0.18;
        const fontSize = maxOptionHeight * 0.27;
        
        // Position further to the left (11% of image width) and keep vertical position
        const textX = placement.x + placement.width * 0.11;
        const textY = placement.y + placement.height * 0.62;
        
        textSize(fontSize);
        textAlign(LEFT, CENTER);
        
        // Calculate the total width of name and question mark
        const nameWidth = textWidth(yourName);
        const questionMarkWidth = textWidth("?");
        
        // Draw the name in the specified green (#80C242)
        fill('#80C242');
        text(yourName, textX, textY);
        
        // Draw the question mark in black, immediately after the name with slight spacing
        fill(0); // Black color for question mark
        text("?", textX + nameWidth + (fontSize * 0.1), textY);
        
        // Reset text settings
        textAlign(CENTER, CENTER);
        textSize(height * 0.02);
        textFont('sans-serif');
      }
      // Handle special case for final drink delivery (Q6)
      else if (currentQuestion.includes("here's your drink")) {
        const placement = getImagePlacement();
        image(peteQ6Image, placement.x, placement.y, placement.width, placement.height);
        
        // Display the entered name on top of the image in green followed by a black comma
        if (pixellariFont) {
          textFont(pixellariFont);
        }
        
        // Use the same formatting as in Q5.1
        const maxOptionHeight = height * 0.18;
        const fontSize = maxOptionHeight * 0.27;
        const textX = placement.x + placement.width * 0.11;
        const textY = placement.y + placement.height * 0.62;
        
        textSize(fontSize);
        textAlign(LEFT, CENTER);
        
        // Calculate the width of the name for positioning the comma
        const nameWidth = textWidth(yourName);
        
        // Draw the name in the specified green (#80C242)
        fill('#80C242');
        text(yourName, textX, textY);
        
        // Draw the comma in black, immediately after the name with slight spacing
        fill(0); // Black color for comma
        text(",", textX + nameWidth + (fontSize * 0.05), textY);
        
        // Reset text settings
        textAlign(CENTER, CENTER);
        textSize(height * 0.02);
        textFont('sans-serif');
      }
      else if (questionImage) {
        // Use consistent image placement
        const placement = getImagePlacement();
        image(questionImage, placement.x, placement.y, placement.width, placement.height);
      } else {
        // For other questions, display text
        fill(255);
        rect(width/2 - 300, 50, 600, 100, 20);
        fill(0);
        text(currentQuestion, width/2, 100);
      }
    }
    
    // Determine display time based on question type
    let displayTime = 2000; // Default
    
    if (state === "pete") {
      if (currentQuestion === "Can I take your order please?") {
        displayTime = peteOrderTime * 1000;
      } else if (currentQuestion === "What can I get you?") {
        displayTime = drinkOrderTime * 1000; 
      } else if (currentQuestion === "Ya! What ……..?" && peteVideoFinished) {
        // After video finishes, use normal timing
        displayTime = drinkOrderTime * 1000;
      } else if (currentQuestion === "Ya! What ……..?" && !peteVideoFinished) {
        // During video playback, don't show options automatically
        displayTime = 999999; // Very long time
      } else if (currentQuestion.includes("NEXT CUSTOMER")) {
        displayTime = rejectionTime * 1000;
      } else if (currentQuestion.includes("here's your drink")) {
        displayTime = drinkOrderTime * 5000; // 5 seconds for final drink delivery as specified
      } else if (currentQuestion.includes("ok then")) {
        displayTime = drinkOrderTime * 2000; // Short pause for name confirmation before moving to final screen
      }
    }
    
    // Check if time is up
    if (millis() - displayTimer > displayTime) {
      showOptions = true;
      timerStarted = false;
      
      // Handle special cases that transition to different states
      if (currentQuestion.includes("NEXT CUSTOMER")) {
        state = "selection"; // Go back to barista selection
        showOptions = false;
        currentQuestion = "";
        responseOptions = [];
      } else if (currentQuestion.includes("here's your drink")) {
        state = "pete_end"; // Go to pete_end screen after drink delivery
        showOptions = false;
        currentQuestion = "";
        responseOptions = [];
      }
    }
  }
  
  // Show response options when needed
  if (showOptions) {
    drawResponseOptions();
  }
}

// Draw mug scene
function drawMug() {
  // Draw mug background
  if (mugBackground) {
    image(mugBackground, 0, 0, width, height);
  } else {
    // Fallback if image doesn't load
    background(220, 200, 180);
    text("Enjoying your drink", width/2, height/2);
  }
  
  // No return button or other interactive elements
}

// Render response options for Pete's dialogue
function drawResponseOptions() {
  if (responseOptions.length === 0) return;

  const blankImagePlacement = getImagePlacement();
  const maxOptionHeight = height * 0.18;
  const blankRightEdge = blankImagePlacement.x + blankImagePlacement.width;
  const remainingSpace = width - blankRightEdge;
  const optionSpacing = height * 0.02;
  const bottomMargin = optionSpacing;
  
  // Process options to get their details (image keys, dimensions)
  let optionDetails = [];
  
  // Map text descriptions to image keys
  const textToImageMap = {
    "P_R1.1": "P_R1.1",
    "1. Can you repeat that please?": "P_R1.1",
    "No?": "R_NO",
    "3. No?": "R_NO",
    "Yea?": "R_YES",
    "2. Yea?": "R_YES",
    "1. Slow matcha?": "P_R3.1",
    "2. Bamboo tea?": "P_R3.2",
    "3. Black Eye espresso?": "P_R3.3",
    "I didn't catch that": "P_R4.2",
    "I didn't catch that, can you repeat?": "P_R4.2",
    "P_R4.2": "P_R4.2",
    "*make a type box": "P_R4.Blank"
  };
  
  // Get option identifiers based on image key
  const imageToOptionMap = {
    "P_R1.1": "1",
    "P_R3.1": "1", 
    "R_YES": "2",
    "P_R3.2": "2",
    "R_NO": "3",
    "P_R3.3": "3",
    "P_R4.2": "repeat",
    "P_R4.Blank": "textbox"
  };
  
  // Process each response option
  for (let i = 0; i < responseOptions.length; i++) {
    const optionText = responseOptions[i];
    
    // Determine image key
    let imageKey;
    
    if (optionText.startsWith("*make a type box")) {
      imageKey = "P_R4.Blank";
    } else {
      imageKey = responseImages[optionText] ? optionText : textToImageMap[optionText];
    }
    
    if (imageKey && responseImages[imageKey]) {
      const originalWidth = responseImages[imageKey].width;
      const originalHeight = responseImages[imageKey].height;
      
      const imgHeight = Math.min(maxOptionHeight, height * 0.18);
      const imgWidth = (imgHeight / originalHeight) * originalWidth;
      
      optionDetails.push({
        imageKey: imageKey,
        width: imgWidth,
        height: imgHeight,
        option: imageToOptionMap[imageKey] || "1", // Default to "1" if not found
        isTextInput: imageKey === "P_R4.Blank",
        index: i,
        x: 0, // Will be set later
        y: 0  // Will be set later
      });
    }
  }
  
  // If no valid options, return
  if (optionDetails.length === 0) return;
  
  // Calculate positions for options
  const optionHeight = optionDetails[0].height;
  const optionWidth = optionDetails[0].width;
  const startX = blankRightEdge + (remainingSpace / 2) - (optionWidth / 2);
  
  // Define slot positions
  const slot3Y = height - bottomMargin - optionHeight;
  const slot2Y = slot3Y - optionHeight - optionSpacing;
  const slot1Y = slot2Y - optionHeight - optionSpacing;
  const slotPositions = [slot1Y, slot2Y, slot3Y];
  
  // Determine which slots to use based on number of options
  const slotsMap = [
    [],            // 0 options
    [2],           // 1 option
    [1, 2],        // 2 options
    [0, 1, 2]      // 3 options
  ];
  
  const slotsToUse = slotsMap[optionDetails.length] || [];
  
  // Draw each option in its slot and store positions
  for (let i = 0; i < optionDetails.length; i++) {
    if (i >= slotsToUse.length) break;
    
    const slotIndex = slotsToUse[i];
    const slotY = slotPositions[slotIndex];
    const opt = optionDetails[i];
    
    // Store position for click detection
    opt.x = startX;
    opt.y = slotY;

    // Draw the option image
    image(
      responseImages[opt.imageKey],
      opt.x,
      opt.y,
      opt.width,
      opt.height
    );

    // If this is a text input option, draw the text input field on top
    if (opt.isTextInput) {
      drawTextInputOnBlank(opt.x, opt.y, opt.width, opt.height);
    }
  }
}

// Draw Meowchi's dialogue
function drawMeowchiDialogue() {
  // When showing final dialogue, use mug background
  if (currentQuestion === "MEOWCHI_Q8") {
    // Draw the mug background for the final dialogue
    if (mugBackground) {
      image(mugBackground, 0, 0, width, height);
    }
  } else {
    // For all other dialogue, use Meowchi's background
    if (meowchiBackground) {
      image(meowchiBackground, 0, 0, width, height);
    } else {
      background(200, 220, 255); // Fallback color
    }
  }
  
  // Handle video playback for Q6 (blender scene)
  if (currentQuestion === "Compris. Puis-je avoir ton n-BLENDERRRR") {
    const placement = getImagePlacement();
    
    // Sequence: Show blank image, then immediately start video
    if (!window.blankShown && !meowchiVideoPlaying && !meowchiVideoFinished) {
      // Display blank image first
      image(meowchiBlankImage, placement.x, placement.y, placement.width, placement.height);
      
      // Mark that we've shown the blank image
      window.blankShown = true;
      
      // Start the video immediately
      if (meowchiQ6Video) {
        // Make sure video is ready before playing
        if (meowchiQ6Video.elt.readyState >= 2) { // HAVE_CURRENT_DATA or better
          console.log("Video ready, starting playback immediately");
          window.videoStartTime = millis();
          meowchiQ6Video.loop(false); // Play once
          meowchiQ6Video.volume(1);
          meowchiVideoPlaying = true;
        } else {
          // If video isn't ready yet, wait for it
          console.log("Video not ready yet, waiting...");
          meowchiQ6Video.elt.addEventListener('canplay', function videoCanPlayHandler() {
            console.log("Video can play now, starting playback");
            window.videoStartTime = millis();
            meowchiQ6Video.loop(false);
            meowchiQ6Video.volume(1);
            meowchiVideoPlaying = true;
            // Remove event listener to prevent multiple calls
            meowchiQ6Video.elt.removeEventListener('canplay', videoCanPlayHandler);
          });
        }
      }
    }
    // During video playback
    else if (meowchiVideoPlaying && meowchiQ6Video) {
      // Display video while it's playing - FILL THE ENTIRE CANVAS
      image(meowchiQ6Video, 0, 0, width, height);
      
      // Check if video has been playing for more than 5 seconds (video duration)
      // This is a backup in case the onended callback doesn't fire
      if (window.videoStartTime && (millis() - window.videoStartTime > 5000)) {
        console.log("Video timeout reached - ending video");
        meowchiVideoPlaying = false;
        meowchiVideoFinished = true;
        
        // Stop and hide the video
        meowchiQ6Video.stop();
        meowchiQ6Video.hide();
        
        // Reset timestamp
        window.videoStartTime = null;
      }
    }
    // After video completes
    else if (meowchiVideoFinished) {
      // After video ends, show blank image until response is made
      image(meowchiBlankImage, placement.x, placement.y, placement.width, placement.height);
      
      // Show response options after video finishes
      if (!showOptions) {
        showOptions = true;
      }
    }
    // If video failed to load
    else if (!meowchiQ6Video) {
      // Show the blank image with no video
      image(meowchiBlankImage, placement.x, placement.y, placement.width, placement.height);
      
      // Show response options after a delay
      if (!showOptions && !window.responseOptionsTimeoutSet) {
        window.responseOptionsTimeoutSet = true;
        setTimeout(() => {
          showOptions = true;
        }, 5000); // Show options after 5 seconds (simulating video length)
      }
    }
  }
  // Handle non-video dialogue states
  else if (currentQuestion) {
    if (!timerStarted) {
      displayTimer = millis();
      timerStarted = true;
      
      // AUDIO ADDITION - Play audio when first showing the question
      playAudioForState("meowchi", currentQuestion);
    }
    
    // Map questions to images and draw appropriately
    const questionImageMap = {
      "[speaks in Meowish]": meowchiQ1Image,
      "meow meow me-meow meow?": meowchiQ2Image, // Normal face
      "concerned_meow": meowchiQ3Image, // Concerned face for the meow
      "concerned_french": meowchiQ4_1Image, // Que voulez-vous boire with concerned face
      "normal_french": meowchiQ4_2Image, // Que voulez-vous boire with normal face
      "D'accord.. Vous etes pret?": meowchiQ5Image, // Updated for new text
      "Oh d'accord alors…": meowchiQ5_1Image,
      "Quelle boisson veux-tu?": meowchiQ5_2Image,
      "… votre nom?": meowchiQ7_2Image
    };
    
    // Handle special case for name confirmation (Q7.3)
    if (currentQuestion === "MEOWCHI_Q7_3") {
      const placement = getImagePlacement();
      image(meowchiQ7_3Image, placement.x, placement.y, placement.width, placement.height);
      
      // Display the entered name on top of the image
      if (pixellariFont) {
        textFont(pixellariFont);
      }
      
      const maxOptionHeight = height * 0.18;
      const fontSize = maxOptionHeight * 0.27;
      
      // Position further to the left (9% of image width instead of 11%)
      const textX = placement.x + placement.width * 0.09;
      const textY = placement.y + placement.height * 0.62;
      
      textSize(fontSize);
      textAlign(LEFT, CENTER);
      
      // Draw the name in Meowchi's color (#b166aa)
      fill('#b166aa');
      text(yourName, textX, textY);
      
      // Calculate the width of the name for positioning the comma
      const nameWidth = textWidth(yourName);
      
      // Draw the comma in black, immediately after the name with slight spacing
      fill(0); // Black color for comma
      text(",", textX + nameWidth + (fontSize * 0.05), textY);
      
      // Reset text settings
      textAlign(CENTER, CENTER);
      textSize(height * 0.02);
      textFont('sans-serif');
    }
    // Handle special case for final drink delivery (Q8)
    else if (currentQuestion === "MEOWCHI_Q8") {
      const placement = getImagePlacement();
      image(meowchiQ8Image, placement.x, placement.y, placement.width, placement.height);
      
      // Display the entered name on top of the image
      if (pixellariFont) {
        textFont(pixellariFont);
      }
      
      const maxOptionHeight = height * 0.18;
      const fontSize = maxOptionHeight * 0.27;
      
      // Position further to the left (9% of image width instead of 11%)
      const textX = placement.x + placement.width * 0.09;
      const textY = placement.y + placement.height * 0.62;
      
      textSize(fontSize);
      textAlign(LEFT, CENTER);
      
      // Draw the name in Meowchi's color (#b166aa)
      fill('#b166aa');
      text(yourName, textX, textY);
      
      // Calculate the width of the name for positioning the comma
      const nameWidth = textWidth(yourName);
      
      // Draw the comma in black, immediately after the name with slight spacing
      fill(0); // Black color for comma
      text(",", textX + nameWidth + (fontSize * 0.05), textY);
      
      // Reset text settings
      textAlign(CENTER, CENTER);
      textSize(height * 0.02);
      textFont('sans-serif');
    }
    // Handle special case for name question (Q7.1)
    else if (currentQuestion === "MEOWCHI_Q7_1") {
      const placement = getImagePlacement();
      image(meowchiQ7_1Image, placement.x, placement.y, placement.width, placement.height);
      
      // Display the entered name on top of the image
      if (pixellariFont) {
        textFont(pixellariFont);
      }
      
      const maxOptionHeight = height * 0.18;
      const fontSize = maxOptionHeight * 0.27;
      
      // Position further to the left (9% of image width instead of 11%)
      const textX = placement.x + placement.width * 0.09;
      const textY = placement.y + placement.height * 0.62;
      
      textSize(fontSize);
      textAlign(LEFT, CENTER);
      
      // Draw the name in Meowchi's color (#b166aa)
      fill('#b166aa');
      text(yourName, textX, textY);
      
      // Calculate width for question mark positioning
      const nameWidth = textWidth(yourName);
      
      // Draw the question mark in black, immediately after the name with slight spacing
      fill(0); // Black color for question mark
      text("?", textX + nameWidth + (fontSize * 0.1), textY);
      
      // Reset text settings
      textAlign(CENTER, CENTER);
      textSize(height * 0.02);
      textFont('sans-serif');
    }
    else if (meowishSequenceActive && currentQuestion === "meow meow me-meow meow?") {
      // Show the confused face first, then the meowish dialogue again with concerned face (Q3.1)
      const placement = getImagePlacement();
      
      // Show confused face for 1 second
      if (millis() - displayTimer < 1000) {
        image(meowchiBlankConfusedImage, placement.x, placement.y, placement.width, placement.height);
      } else {
        // After 1 second, show the concerned face (handled by changing currentQuestion in setTimeout)
        image(meowchiQ3Image, placement.x, placement.y, placement.width, placement.height);
      }
    }
    else if (questionImageMap[currentQuestion]) {
      // Use consistent image placement
      const placement = getImagePlacement();
      image(questionImageMap[currentQuestion], placement.x, placement.y, placement.width, placement.height);
    } else {
      // For other questions, display text
      fill(255);
      rect(width/2 - 300, 50, 600, 100, 20);
      fill(0);
      text(currentQuestion, width/2, 100);
    }
    
    // Only check for timer if options aren't showing yet
    if (!showOptions) {
      // Determine display time based on question type
      let displayTime = 2000; // Default
      
      if (state === "meowchi") {
        if (currentQuestion === "[speaks in Meowish]") {
          displayTime = meowOrderTime * 1000;
        } else if (currentQuestion === "meow meow me-meow meow?") {
          if (meowishSequenceActive) {
            // Add extra time for the confused face transition
            displayTime = meowOrderTime * 1000 + 1000;
          } else {
            displayTime = meowOrderTime * 1000;
          }
        } else if (currentQuestion === "concerned_meow") {
          // We've already handled the transition in handleMeowchiResponse
          displayTime = 0; // No additional delay needed as responses were set in the setTimeout
        }       else if (currentQuestion.includes("Que voulez-vous") || 
                   currentQuestion === "concerned_french" ||
                   currentQuestion === "normal_french" ||
                   currentQuestion.includes("Quelle boisson") ||
                   currentQuestion === "D'accord.. Vous etes pret?") { // Add the new question
          displayTime = frenchOrderTime * 1000; 
        } else if (currentQuestion.includes("Oh d'accord alors")) {
          displayTime = 3000; // 3 seconds for rejection message as specified
        } else if (currentQuestion.includes("votre boisson est prête")) {
          displayTime = 4000; // 4 seconds for final drink message
        } else if (currentQuestion.includes("d'accord") && !currentQuestion.includes("Oh")) {
          displayTime = 2000; // Short pause for name confirmation
        }
      }
      
      // Check if time is up to display options
      if (millis() - displayTimer > displayTime) {
        showOptions = true;
        
        // Handle special cases that transition to mug state
        if (currentQuestion.includes("votre boisson est prête") || currentQuestion === "MEOWCHI_Q8") {
          state = "mug";
          showOptions = false;
          currentQuestion = "";
          responseOptions = [];
        }
      }
    }
    
    // Special case for exit delay handling - MOVED OUTSIDE the showOptions check
    // to ensure it always runs when needed
    if (currentQuestion === "Oh d'accord alors…" && meowchiExitDelay) {
      const exitDisplayTime = 3000; // 3 seconds
      
      // Check if 3 seconds have passed, then return to barista selection
      if (millis() - displayTimer > exitDisplayTime) {
        console.log("Exit delay complete, returning to barista selection");
        state = "selection";
        meowchiExitDelay = false; // Reset the flag
        currentQuestion = ""; // Clear current question
        responseOptions = []; // Clear response options
      }
    }
  }
  
  // Show response options when needed - drawn on top of the questions
  if (showOptions) {
    drawMeowchiResponseOptions();
  }
}

// Draw Meowchi's response options
function drawMeowchiResponseOptions() {
  if (responseOptions.length === 0) return;

  const blankImagePlacement = getImagePlacement();
  const maxOptionHeight = height * 0.18;
  const blankRightEdge = blankImagePlacement.x + blankImagePlacement.width;
  const remainingSpace = width - blankRightEdge;
  const optionSpacing = height * 0.02;
  const bottomMargin = optionSpacing;
  
  // Process options to get their details (image keys, dimensions)
  let optionDetails = [];
  
  // Map text descriptions to image keys - updated for new sequence
  const textToImageMap = {
    "Display Captions": "M_R1.1",
    "Huh": "M_R2.1",
    "Meow": "M_R2.2",
    "Subtitle Translation": "M_R2.3",
    "French": "M_R3.1",
    "English": "M_R3.2",
    "re-chose barista": "M_R3.3", // Using the available image for this
    "For here": "M_R4.1",
    "A drink": "M_R4.2",
    "Yes": "M_YES",
    "No": "M_NO",
    "Whisker Matcha": "M_R5.1",
    "PURspresso": "M_R5.2",
    "Catnip Tea": "M_R5.3",
    "WHAT DID YOU SAY?": "M_R6",
    "*make a type box": "M_R6.Blank"
  };
  
  // Get option identifiers based on image key
  const imageToOptionMap = {
    "M_R1.1": "Display Captions",
    "M_R2.1": "Huh",
    "M_R2.2": "Meow", 
    "M_R2.3": "Subtitle Translation",
    "M_R3.1": "French",
    "M_R3.2": "English",
    "M_R3.3": "re-chose barista",
    "M_R4.1": "1", // For here
    "M_R4.2": "2", // A drink
    "M_YES": "yes",
    "M_NO": "no",
    "M_R5.1": "1", // Whisker Matcha
    "M_R5.2": "2", // PURspresso
    "M_R5.3": "3", // Catnip Tea
    "M_R6": "what", // WHAT DID YOU SAY?
    "M_R6.Blank": "textbox"
  };
  
  // Process each response option
  for (let i = 0; i < responseOptions.length; i++) {
    const optionText = responseOptions[i];
    
    // Determine image key
    let imageKey;
    
    if (optionText.startsWith("*make a type box")) {
      imageKey = "M_R6.Blank";
    } else {
      imageKey = meowchiResponseImages[optionText] ? optionText : textToImageMap[optionText];
    }
    
    if (imageKey && (meowchiResponseImages[imageKey] || responseImages[imageKey])) {
      // Get the image from either collection
      const imageObj = meowchiResponseImages[imageKey] || responseImages[imageKey];
      const originalWidth = imageObj.width;
      const originalHeight = imageObj.height;
      
      const imgHeight = Math.min(maxOptionHeight, height * 0.18);
      const imgWidth = (imgHeight / originalHeight) * originalWidth;
      
      optionDetails.push({
        imageKey: imageKey,
        width: imgWidth,
        height: imgHeight,
        option: imageToOptionMap[imageKey] || optionText, // Use the mapped option or default to text
        isTextInput: imageKey === "M_R6.Blank",
        selectable: imageKey !== "M_R3.2", // English not available
        index: i,
        x: 0, // Will be set later
        y: 0  // Will be set later
      });
    }
  }
  
  // If no valid options, return
  if (optionDetails.length === 0) return;
  
  // Calculate positions for options
  const optionHeight = optionDetails[0].height;
  const optionWidth = optionDetails[0].width;
  const startX = blankRightEdge + (remainingSpace / 2) - (optionWidth / 2);
  
  // Define slot positions
  const slot3Y = height - bottomMargin - optionHeight;
  const slot2Y = slot3Y - optionHeight - optionSpacing;
  const slot1Y = slot2Y - optionHeight - optionSpacing;
  const slotPositions = [slot1Y, slot2Y, slot3Y];
  
  // Determine which slots to use based on number of options
  const slotsMap = [
    [],            // 0 options
    [2],           // 1 option
    [1, 2],        // 2 options
    [0, 1, 2]      // 3 options
  ];
  
  const slotsToUse = slotsMap[optionDetails.length] || [];
  
  // Check for proper timing when to show options - for R7 and R8
  // For video-related Q7, we've already handled this in the video completion callback
  if (currentQuestion === "… votre nom?" && !timerStarted) {
    displayTimer = millis();
    timerStarted = true;
    return; // Don't show options yet until timing is correct
  }
  
  // For R8, check if enough time has passed before showing options
  if (currentQuestion === "… votre nom?" && millis() - displayTimer < meowOrderTime * 1000) {
    return; // Not enough time passed yet for options to appear
  }
  
  // Draw each option in its slot and store positions
  for (let i = 0; i < optionDetails.length; i++) {
    if (i >= slotsToUse.length) break;
    
    const slotIndex = slotsToUse[i];
    const slotY = slotPositions[slotIndex];
    const opt = optionDetails[i];
    
    // Store position for click detection
    opt.x = startX;
    opt.y = slotY;

    // Draw the option image
    const imageObj = meowchiResponseImages[opt.imageKey] || responseImages[opt.imageKey];
    image(
      imageObj,
      opt.x,
      opt.y,
      opt.width,
      opt.height
    );

    // No grey overlay for non-selectable options - removed per request
    // They will still be non-clickable through the mousePressed logic

    // If this is a text input option, draw the text input field on top
    if (opt.isTextInput) {
      drawTextInputOnBlank(opt.x, opt.y, opt.width, opt.height);
    }
  }
}

// Helper function to check if input only contains spaces
function containsOnlySpaces(str) {
  return str.trim().length === 0;
}

// Draw text input on blank image
function drawTextInputOnBlank(x, y, width, height) {
  // Position text further to the left within the image (about 15% from left edge)
  const textX = x + width * 0.15;
  // Position text slightly higher than center (45% from top instead of 50%)
  const textY = y + height * 0.45;

  // Use an even larger text size for better visibility
  const textFontSize = height * 0.25; // Increased from 0.2 to 0.25
  // Use consistent colors for text and caret
  const placeholderCol = color(150, 150, 150); // Gray color for placeholder
  const userTextCol = color('#414042'); // Specific color for user input
  const caretCol = color(100, 100, 100); // Slightly darker gray for caret

  // Handle blinking cursor
  if (millis() - lastCursorBlink > CURSOR_BLINK_RATE) {
    cursorVisible = !cursorVisible;
    lastCursorBlink = millis();
  }

  // Draw the text (either placeholder or typed input)
  textAlign(LEFT, CENTER); // Left alignment

  // Set the Pixellari font if it's loaded
  if (pixellariFont) {
    textFont(pixellariFont);
  }

  if (!isTypingActive && userInput === "") {
    // Show placeholder when not typing and no input
    textSize(textFontSize);
    fill(placeholderCol); // Gray for placeholder
    text("type response", textX, textY);
  } else {
    // When typing or with input
    textSize(textFontSize);

    if (userInput.length > 0) {
      // Use specific color for user input text
      fill(userTextCol); 
      
      // Add selection highlight if applicable
      if (selectionMode !== 'none') {
        const beforeSelectedText = userInput.substring(0, selectionStart);
        const selectedText = userInput.substring(selectionStart, selectionEnd);
        
        const beforeWidth = textWidth(beforeSelectedText);
        const selectedWidth = textWidth(selectedText);

        // Draw selection rectangle
        fill(200, 200, 255, 100); // Light blue with transparency
        noStroke();
        rect(textX + beforeWidth, textY - textFontSize/2, selectedWidth, textFontSize);
        
        // Reset text color for input
        fill(userTextCol);
      }
      
      text(userInput, textX, textY);
      
      // Calculate where to draw the cursor
      let beforeCursor = userInput.substring(0, cursorPosition);
      let cursorX = textX + textWidth(beforeCursor);
      
      // Draw blinking cursor at current position
      if (isTypingActive && cursorVisible) {
        stroke(caretCol);
        strokeWeight(2);
        line(cursorX, textY - textFontSize/2, cursorX, textY + textFontSize/2);
        noStroke();
      }
    } else {
      // Just show blinking cursor for empty input when focused
      if (isTypingActive && cursorVisible) {
        stroke(caretCol);
        strokeWeight(2);
        line(textX, textY - textFontSize/2, textX, textY + textFontSize/2);
        noStroke();
      }
    }
  }

  // Reset text size and font
  textSize(height * 0.025);
  textFont('sans-serif'); // Reset to default font

  // Show checkmark if input meets criteria (at least 1 character and not only spaces and not exceeding max)
  const hasValidInput = userInput.length > 0 && !containsOnlySpaces(userInput) && userInput.length <= maxCharacters;
  checkmarkVisible = hasValidInput;

  if (checkmarkVisible) {
    // Place checkmark inside the image on the right side (about 85% from left edge)
    const checkSize = height * 0.5; // Increased from 0.4 to 0.5
    const checkX = x + width * 0.85 - checkSize/2; // Inside image, right side
    const checkY = y + (height - checkSize)/2 - height * 0.05; // Slightly up

    // Use checkmark image if available
    if (checkmarkImage) {
      image(checkmarkImage, checkX, checkY, checkSize, checkSize);
    } else {
      // Fallback drawn checkmark
      fill(0, 200, 0);
      rect(checkX, checkY, checkSize, checkSize, 10);
      fill(255);
      textSize(checkSize * 0.6);
      text("✓", checkX + checkSize/2, checkY + checkSize/2);
      textSize(height * 0.025); // Reset text size
    }
  }
}

// Handle mouse press events
function mousePressed() {
  try {
  // Handle barista selection
  if (state === "selection") {
    if (baristaPeteImage && baristaMeowchiImage) {
      // Calculate image dimensions and positions (same as in drawBaristaSelection)
      const imageHeight = height * 0.15; // 15% of screen height
      const peteWidth = (imageHeight / baristaPeteImage.height) * baristaPeteImage.width;
      const meowchiWidth = (imageHeight / baristaMeowchiImage.height) * baristaMeowchiImage.width;
      
      const spacing = width * 0.1;
      const totalWidth = peteWidth + meowchiWidth + spacing;
      const startX = (width - totalWidth) / 2;
      
      // Position them at 90% from the top
      const startY = height * 0.90 - imageHeight;
      
      // Check if clicked on Pete's image
      if (mouseX >= startX && mouseX < startX + peteWidth &&
          mouseY >= startY && mouseY < startY + imageHeight) {
        selectedBarista = "pete";
        state = "pete";
        startPeteDialogue();
        return;
      }
      
      // Check if clicked on Meowchi's image
      if (mouseX >= startX + peteWidth + spacing && mouseX < startX + peteWidth + spacing + meowchiWidth &&
          mouseY >= startY && mouseY < startY + imageHeight) {
        selectedBarista = "meowchi";
        state = "meowchi";
        startMeowchiDialogue();
        return;
      }
    } else {
      // Fallback using the old button positions if images didn't load
      const buttonWidth = width/5;
      const buttonHeight = height/6;
      
      // Check Pete button
      if (mouseX > width/4 - buttonWidth/2 && mouseX < width/4 + buttonWidth/2 && 
          mouseY > height * 0.9 - buttonHeight/2 && mouseY < height * 0.9 + buttonHeight/2) {
        selectedBarista = "pete";
        state = "pete";
        startPeteDialogue();
        return;
      }
      
      // Check Meowchi button
      if (mouseX > 3*width/4 - buttonWidth/2 && mouseX < 3*width/4 + buttonWidth/2 && 
          mouseY > height * 0.9 - buttonHeight/2 && mouseY < height * 0.9 + buttonHeight/2) {
        selectedBarista = "meowchi";
        state = "meowchi";
        startMeowchiDialogue();
        return;
      }
    }
  }

  // Handle response options for Pete dialogue
  else if (showOptions && state === "pete") {
    // First, process response options to identify what's on screen
    const blankImagePlacement = getImagePlacement();
    const maxOptionHeight = height * 0.18;
    const blankRightEdge = blankImagePlacement.x + blankImagePlacement.width;
    const remainingSpace = width - blankRightEdge;
    const optionSpacing = height * 0.02;
    const bottomMargin = optionSpacing;
    
    // Process options to get their details
    let optionDetails = [];
    
    // Map text descriptions to image keys
    const textToImageMap = {
      "P_R1.1": "P_R1.1",
      "R_NO": "R_NO",
      "R_YES": "R_YES",
      "P_R3.1": "P_R3.1",
      "P_R3.2": "P_R3.2",
      "P_R3.3": "P_R3.3",
      "P_R4.2": "P_R4.2",
      "*make a type box": "P_R4.Blank"
    };
    
    // Get option identifiers based on image key
    const imageToOptionMap = {
      "P_R1.1": "1",
      "P_R3.1": "1", 
      "R_YES": "2",
      "P_R3.2": "2",
      "R_NO": "3",
      "P_R3.3": "3",
      "P_R4.2": "repeat",
      "P_R4.Blank": "textbox"
    };
    
    // Process each response option
    for (let i = 0; i < responseOptions.length; i++) {
      const optionText = responseOptions[i];
      
      // Determine image key
      let imageKey;
      
      if (optionText.startsWith("*make a type box")) {
        imageKey = "P_R4.Blank";
      } else {
        imageKey = responseImages[optionText] ? optionText : textToImageMap[optionText];
      }
      
      if (imageKey && responseImages[imageKey]) {
        const originalWidth = responseImages[imageKey].width;
        const originalHeight = responseImages[imageKey].height;
        
        const imgHeight = Math.min(maxOptionHeight, height * 0.18);
        const imgWidth = (imgHeight / originalHeight) * originalWidth;
        
        optionDetails.push({
          imageKey: imageKey,
          width: imgWidth,
          height: imgHeight,
          option: imageToOptionMap[imageKey] || "1", // Default to "1" if not found
          isTextInput: imageKey === "P_R4.Blank",
          index: i,
          x: 0, // Will be set later
          y: 0  // Will be set later
        });
      }
    }
    
    // If no valid options, return
    if (optionDetails.length === 0) return;
    
    // Calculate positions for options
    const optionHeight = optionDetails[0].height;
    const optionWidth = optionDetails[0].width;
    const startX = blankRightEdge + (remainingSpace / 2) - (optionWidth / 2);
    
    // Define slot positions
    const slot3Y = height - bottomMargin - optionHeight;
    const slot2Y = slot3Y - optionHeight - optionSpacing;
    const slot1Y = slot2Y - optionHeight - optionSpacing;
    const slotPositions = [slot1Y, slot2Y, slot3Y];
    
    // Determine which slots to use based on number of options
    const slotsMap = [
      [],            // 0 options
      [2],           // 1 option
      [1, 2],        // 2 options
      [0, 1, 2]      // 3 options
    ];
    
    const slotsToUse = slotsMap[optionDetails.length] || [];
    
    // Static variables to track click timing
    if (typeof mousePressed.lastClickTime === 'undefined') {
      mousePressed.lastClickTime = 0;
      mousePressed.clickCount = 0;
    }

    // Check for click on checkmark first (if visible)
    if (checkmarkVisible) {
      // Find the text input option
      const textInputOption = optionDetails.find(opt => opt.isTextInput);
      if (textInputOption) {
        const textInputIndex = optionDetails.indexOf(textInputOption);
        if (textInputIndex < slotsToUse.length) {
          const slotIndex = slotsToUse[textInputIndex];
          const slotY = slotPositions[slotIndex];
          
          // Calculate checkmark position to match visual position inside the image
          const checkSize = optionHeight * 0.5; 
          const checkX = startX + optionWidth * 0.85 - checkSize/2; 
          const checkY = slotY + (optionHeight - checkSize)/2 - optionHeight * 0.05;
          
          // Check if clicked on checkmark
          if (mouseX > checkX && mouseX < checkX + checkSize && 
              mouseY > checkY && mouseY < checkY + checkSize) {
            // Handle checkmark click
            yourName = userInput;
            userInput = "";
            isTypingActive = false;
            handlePeteResponse("checkmark");
            return;
          }
        }
      }
    }
    
    // Check for click on any option
    for (let i = 0; i < optionDetails.length; i++) {
      if (i >= slotsToUse.length) break;
      
      const slotIndex = slotsToUse[i];
      const slotY = slotPositions[slotIndex];
      const opt = optionDetails[i];
      
      // Store position for click detection
      opt.x = startX;
      opt.y = slotY;
      
      // Check if clicked within this option's bounds
      if (mouseX > opt.x && mouseX < opt.x + opt.width &&
          mouseY > opt.y && mouseY < opt.y + opt.height) {
    
        // Special handling for text input option
        if (opt.isTextInput) {
          // Activate typing and handle text cursor positioning
          isTypingActive = true;
          
          // Calculate text-related dimensions
          const textX = startX + optionWidth * 0.15;
          const textY = slotY + optionHeight * 0.45;
          const textFontSize = optionHeight * 0.25;
          
          // Use the same font settings as in drawTextInputOnBlank
          if (pixellariFont) {
            textFont(pixellariFont);
          }
          textSize(textFontSize);
          
          // Determine character position based on mouse click
          if (mouseX > textX && mouseX < startX + optionWidth * 0.85) {
            // Determine the character position by measuring text widths
            let prevWidth = 0;
            cursorPosition = 0;
            
            for (let i = 0; i <= userInput.length; i++) {
              const currText = userInput.substring(0, i);
              const currWidth = textWidth(currText);
              
              if (mouseX < textX + currWidth) {
                // Use the closer of the two positions
                cursorPosition = (mouseX - (textX + prevWidth) < (textX + currWidth) - mouseX) 
                  ? Math.max(0, i - 1) 
                  : i;
                break;
              }
              
              prevWidth = currWidth;
              
              // If we've reached the end, place cursor at the end
              if (i === userInput.length) {
                cursorPosition = userInput.length;
              }
            }
          }
          
          // Reset text settings
          textSize(height * 0.025);
          textFont('sans-serif');
          
          // Initialize drag selection
          dragStartPos = cursorPosition;
          selectionInProgress = false;  // Not dragging yet, just clicking
          
          // Handle multiple clicks for selection
          const currentTime = millis();
          const DOUBLE_CLICK_DELAY = 300;
          const TRIPLE_CLICK_DELAY = 500;
          
          // Check time since last click
          if (currentTime - mousePressed.lastClickTime <= TRIPLE_CLICK_DELAY) {
            mousePressed.clickCount++;
            
            if (mousePressed.clickCount === 2) {
              // Double-click: Select word
              selectionMode = 'word';
              
              // Find word boundaries
              let start = cursorPosition;
              let end = cursorPosition;
              
              // Move start back to word start
              while (start > 0 && userInput[start-1] !== ' ') {
                start--;
              }
              
              // Move end forward to word end
              while (end < userInput.length && userInput[end] !== ' ') {
                end++;
              }
              
              selectionStart = start;
              selectionEnd = end;
            } else if (mousePressed.clickCount === 3) {
              // Triple-click: Select all
              selectionMode = 'all';
              selectionStart = 0;
              selectionEnd = userInput.length;
            }
          } else {
            // If it's been too long since last click, reset counter
            mousePressed.clickCount = 1;
            
            // Single click: Clear selection unless we're starting a new drag
            if (selectionMode !== 'none') {
              selectionMode = 'none';
              selectionStart = -1;
              selectionEnd = -1;
            }
          }

          // Update last click time
          mousePressed.lastClickTime = currentTime;
          
          return;
        }
        
        // For regular options, deactivate typing and handle the response
        isTypingActive = false;
        
        // Clear text input if clicking on the "I didn't catch that" option (P_R4.2)
        if (opt.imageKey === "P_R4.2") {
          userInput = "";
          cursorPosition = 0;
          
          // Reset selection state
          selectionMode = 'none';
          selectionStart = -1;
          selectionEnd = -1;
        }
        
        handlePeteResponse(opt.option);
        return;
      }
    }
  }

  // Handle response options for Meowchi dialogue
  else if (showOptions && state === "meowchi") {
    // Process response options for Meowchi dialogue
    const blankImagePlacement = getImagePlacement();
    const maxOptionHeight = height * 0.18;
    const blankRightEdge = blankImagePlacement.x + blankImagePlacement.width;
    const remainingSpace = width - blankRightEdge;
    const optionSpacing = height * 0.02;
    const bottomMargin = optionSpacing;
    
    // Process options to get their details
    let optionDetails = [];
    
    // Map text descriptions to image keys - updated for new sequence
    const textToImageMap = {
      "Display Captions": "M_R1.1",
      "Huh": "M_R2.1",
      "Meow": "M_R2.2",
      "Subtitle Translation": "M_R2.3",
      "French": "M_R3.1",
      "English": "M_R3.2",
      "re-chose barista": "M_R3.3", // Using a reused image
      "For here": "M_R4.1",
      "A drink": "M_R4.2",
      "Yes": "M_YES",
      "No": "M_NO",
      "Whisker Matcha": "M_R5.1",
      "PURspresso": "M_R5.2",
      "Catnip Tea": "M_R5.3",
      "WHAT DID YOU SAY?": "M_R6",
      "*make a type box": "M_R6.Blank"
    };
    
    // Get option identifiers based on image key
    const imageToOptionMap = {
      "M_R1.1": "Display Captions",
      "M_R2.1": "Huh",
      "M_R2.2": "Meow", 
      "M_R2.3": "Subtitle Translation",
      "M_R3.1": "French",
      "M_R3.2": "English",
      "M_R3.3": "re-chose barista",
      "M_R4.1": "1", // For here
      "M_R4.2": "2", // A drink
      "M_YES": "yes",
      "M_NO": "no",
      "M_R5.1": "1", // Whisker Matcha
      "M_R5.2": "2", // PURspresso
      "M_R5.3": "3", // Catnip Tea
      "M_R6": "what", // WHAT DID YOU SAY?
      "M_R6.Blank": "textbox"
    };
    
    // Process each response option
    for (let i = 0; i < responseOptions.length; i++) {
      const optionText = responseOptions[i];
      
      // Determine image key
      let imageKey;
      
      if (optionText.startsWith("*make a type box")) {
        imageKey = "M_R6.Blank";
      } else {
        imageKey = meowchiResponseImages[optionText] ? optionText : textToImageMap[optionText];
      }
      
      if (imageKey && (meowchiResponseImages[imageKey] || responseImages[imageKey])) {
        const imageObj = meowchiResponseImages[imageKey] || responseImages[imageKey];
        const originalWidth = imageObj.width;
        const originalHeight = imageObj.height;
        
        const imgHeight = Math.min(maxOptionHeight, height * 0.18);
        const imgWidth = (imgHeight / originalHeight) * originalWidth;
        
        optionDetails.push({
          imageKey: imageKey,
          width: imgWidth,
          height: imgHeight,
          option: imageToOptionMap[imageKey] || optionText,
          isTextInput: imageKey === "M_R6.Blank",
          selectable: imageKey !== "M_R3.2", // English not available
          index: i,
          x: 0,
          y: 0
        });
      }
    }
    
    // If no valid options, return
    if (optionDetails.length === 0) return;
    
    // Calculate positions for options
    const optionHeight = optionDetails[0].height;
    const optionWidth = optionDetails[0].width;
    const startX = blankRightEdge + (remainingSpace / 2) - (optionWidth / 2);
    
    // Define slot positions
    const slot3Y = height - bottomMargin - optionHeight;
    const slot2Y = slot3Y - optionHeight - optionSpacing;
    const slot1Y = slot2Y - optionHeight - optionSpacing;
    const slotPositions = [slot1Y, slot2Y, slot3Y];
    
    // Determine which slots to use based on number of options
    const slotsMap = [
      [],            // 0 options
      [2],           // 1 option
      [1, 2],        // 2 options
      [0, 1, 2]      // 3 options
    ];
    
    const slotsToUse = slotsMap[optionDetails.length] || [];
    
    // For non-video related dialogue, check if enough time has passed for options to be clickable
    if (currentQuestion === "… votre nom?" && 
        millis() - displayTimer < meowOrderTime * 1000) {
      return; // Not enough time passed yet for options to be clickable
    }
    
    // Check for click on checkmark first (if visible)
    if (checkmarkVisible) {
      // Find the text input option
      const textInputOption = optionDetails.find(opt => opt.isTextInput);
      if (textInputOption) {
        const textInputIndex = optionDetails.indexOf(textInputOption);
        if (textInputIndex < slotsToUse.length) {
          const slotIndex = slotsToUse[textInputIndex];
          const slotY = slotPositions[slotIndex];
          
          // Calculate checkmark position
          const checkSize = optionHeight * 0.5; 
          const checkX = startX + optionWidth * 0.85 - checkSize/2; 
          const checkY = slotY + (optionHeight - checkSize)/2 - optionHeight * 0.05;
          
          // Check if clicked on checkmark
          if (mouseX > checkX && mouseX < checkX + checkSize && 
              mouseY > checkY && mouseY < checkY + checkSize) {
            // Handle checkmark click
            yourName = userInput;
            userInput = "";
            isTypingActive = false;
            timerStarted = false; // Reset timer for next step
            handleMeowchiResponse("checkmark");
            return;
          }
        }
      }
    }
    
    // Check for click on any option
    for (let i = 0; i < optionDetails.length; i++) {
      if (i >= slotsToUse.length) break;
      
      const slotIndex = slotsToUse[i];
      const slotY = slotPositions[slotIndex];
      const opt = optionDetails[i];
      
      // Store position for click detection
      opt.x = startX;
      opt.y = slotY;
      
      // Check if clicked within this option's bounds
      if (mouseX > opt.x && mouseX < opt.x + opt.width &&
          mouseY > opt.y && mouseY < opt.y + opt.height) {
        
        // Skip if option is not selectable
        if (!opt.selectable) {
          return;
        }
        
        // Special handling for text input option
        if (opt.isTextInput) {
          isTypingActive = true;
          
          // Position cursor same as in Pete sequence
          const textX = startX + optionWidth * 0.15;
          const textY = slotY + optionHeight * 0.45;
          const textFontSize = optionHeight * 0.25;
          
          if (pixellariFont) {
            textFont(pixellariFont);
          }
          textSize(textFontSize);
          
          // Determine character position based on mouse click
          if (mouseX > textX && mouseX < startX + optionWidth * 0.85) {
            // Determine the character position by measuring text widths
            let prevWidth = 0;
            cursorPosition = 0;
            
            for (let i = 0; i <= userInput.length; i++) {
              const currText = userInput.substring(0, i);
              const currWidth = textWidth(currText);
              
              if (mouseX < textX + currWidth) {
                // Use the closer of the two positions
                cursorPosition = (mouseX - (textX + prevWidth) < (textX + currWidth) - mouseX) 
                  ? Math.max(0, i - 1) 
                  : i;
                break;
              }
              
              prevWidth = currWidth;
              
              // If we've reached the end, place cursor at the end
              if (i === userInput.length) {
                cursorPosition = userInput.length;
              }
            }
          }
          
          // Reset text settings
          textSize(height * 0.025);
          textFont('sans-serif');
          
          // Initialize drag selection
          dragStartPos = cursorPosition;
          selectionInProgress = false;  // Not dragging yet, just clicking
          
          // Handle multiple clicks for selection
          const currentTime = millis();
          const DOUBLE_CLICK_DELAY = 300;
          const TRIPLE_CLICK_DELAY = 500;
          
          // Check time since last click
          if (currentTime - mousePressed.lastClickTime <= TRIPLE_CLICK_DELAY) {
            mousePressed.clickCount++;
            
            if (mousePressed.clickCount === 2) {
              // Double-click: Select word
              selectionMode = 'word';
              
              // Find word boundaries
              let start = cursorPosition;
              let end = cursorPosition;
              
              // Move start back to word start
              while (start > 0 && userInput[start-1] !== ' ') {
                start--;
              }
              
              // Move end forward to word end
              while (end < userInput.length && userInput[end] !== ' ') {
                end++;
              }
              
              selectionStart = start;
              selectionEnd = end;
            } else if (mousePressed.clickCount === 3) {
              // Triple-click: Select all
              selectionMode = 'all';
              selectionStart = 0;
              selectionEnd = userInput.length;
            }
          } else {
            // If it's been too long since last click, reset counter
            mousePressed.clickCount = 1;
            
            // Single click: Clear selection unless we're starting a new drag
            if (selectionMode !== 'none') {
              selectionMode = 'none';
              selectionStart = -1;
              selectionEnd = -1;
            }
          }

          // Update last click time
          mousePressed.lastClickTime = currentTime;
          
          return;
        }
        
        // For regular options, deactivate typing and handle the response
        isTypingActive = false;
        timerStarted = false; // Reset timer for next step
        
        // Clear text input if needed
        if (opt.option === "what") {
          userInput = "";
          cursorPosition = 0;
          
          // Reset selection state
          selectionMode = 'none';
          selectionStart = -1;
          selectionEnd = -1;
        }
        
        handleMeowchiResponse(opt.option);
        return;
      }
    }
  }
  isTypingActive = false;
  } catch (e) {
    console.error('Error in mousePressed:', e);
  }
}