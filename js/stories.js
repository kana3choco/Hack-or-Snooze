"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();
  return $(`
      <li id="${story.storyId}">
        <i class="far fa-heart heart"></i>
        <i class="fas fa-heart heart hidden"></i>
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

/** displays stories added by the user under "my stories" */
function putUserStoriesOnPage() {
  console.debug("putUserStoriesOnPage");

  $userStoriesList.empty();

  if(currentUser.ownStories[0]) {
    for (let story of currentUser.ownStories) {
      const $story = generateStoryMarkup(story);
      let deleteBtn = `<i class="fas fa-trash-alt trash"></i>`
      $story.prepend(deleteBtn);
      $userStoriesList.prepend($story);
      if(currentUser.favorites.some((favorite) => favorite.storyId === story.storyId)) {
        $story.children(".far").toggle();
        $story.children(".fas.fa-heart").toggle();
        };
    }
  } else {$userStoriesList.prepend(`<h4>Add new stories here</h4>`)};

  $userStoriesList.show();
}

// takes user input from the storyForm (author, title, url) and adds it to the API as wells as
// generates the HTML markup to be added to the "my stories" list by calling the putUserStoriesOnPage
// function
async function addNewStory(evt) {
  console.debug("addNewStory");
  evt.preventDefault();
  
  const author = $("#story-author").val();
  const title = $("#story-title").val();
  const url = $("#story-url").val();
  const username = currentUser.username
  const storyData = {author, title, url, username};
  
  const story = await storyList.addStory(currentUser, storyData);
  const $storyHTML = generateStoryMarkup(story);
  $allStoriesList.append($storyHTML);

  $storyForm.trigger("reset");
  $storyForm.show();
  putUserstoriesOnPage();
}
  
$storyForm.on("submit", addNewStory);

// deletes a story from the "my stories" list, as well as the rest of the API
async function deleteStory(evt) {
  // console.debug("deleteStory");
  const $closestLi = $(evt.target).closest("li");
  const storyId = $closestLi.attr("id");

  await storyList.removeStory(currentUser, storyId);
  await putUserStoriesOnPage();
}

$userStoriesList.on("click", ".trash", deleteStory);


// displays the "favorites" list on the "favorites" page
function putFavoriteStoriesListOnPage() {
  console.debug("putFavoriteStoriesListOnPage");
 
  $favoriteStoriesList.empty();

  if (currentUser.favorites[0]) {
    for (let story of currentUser.favorites) {
      const $story = generateStoryMarkup(story);
      $favoriteStoriesList.append($story);
      $story.children(".far").toggle();
      $story.children(".fas.fa-heart").toggle();
    }
  } else {$favoriteStoriesList.append("<h4>Add favorite stories here</h4>")};  

  $favoriteStoriesList.show();
 
}

// when the user clicks the star next to an article, the article is added to the 
// user's "favorites" list
async function addFavorite(evt) {
  console.debug("addFavorite", evt);

  if(!currentUser) {return};
  $(evt.target).toggle();
  $(evt.target).next(".fas.fa-heart").toggle();
  const storyId = $(evt.target).parent("li").attr("id");
  await currentUser.addToFavorites(storyId);
};

$("body").on("click", ".far", async function(evt) {
  await addFavorite(evt);
});

// when the user clicks the star next to an article, the article is removed from the 
// user's "favorites" list
async function removeFavorite(evt) {
  console.debug("removeFavorite", evt);

  $(evt.target).toggle();
  $(evt.target).prev(".far").toggle();
  const storyId = $(evt.target).parent("li").attr("id");
  await currentUser.removeFromFavorites(storyId);
};

$("body").on("click", ".fas.fa-heart", async function(evt) {
  await removeFavorite(evt);
});
