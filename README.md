  <h1 align="center">TAG</h1>

  <p align="center">
    🤖 A Text Annotation GUI powered by machine learning 🤖
  </p>



<!-- TABLE OF CONTENTS -->
## Table of Contents

* [About the Project](#about-the-project)
* [Requirements](#requirements)
* [Features](#features)
* [Usage](#usage)
* [Contributing](#contributing)
* [License](#license)
* [Authors](#authors)




<!-- ABOUT THE PROJECT -->
## About the Project
TAG is a text annotator that allows you to upload documents and highlight them using custom labels and highlight colors.

Oh, and you can train you're own machine learning to highlight for you.




<!-- REQUIREMENTS -->
## Requirements
* [Python 3.X](https://www.python.org/downloads/)
* [spaCy Language Processor](https://spacy.io/usage)
* TAG is supported on Windows, Linux, and MacOS devices



<!-- FEATURES -->
## Features
- Annotate entire document(s) using your own spaCy model
- Or take the annotating into your own hands and highlight manually
- Customizable label names and label colors
- Highlight/unhighlight using searchbar (supports both regular search AND regex)
- View all current highlights by hovering over the right-side panel
	- Click to scroll to that specific highlight
- .txt and .dox file upload support
	- Also supports .zip containing file types of the above
- Download your results!
	- Options include a single JSON of the current document containing the document text, the annotations, and their corresponding labels
	- Extra option to download a .zip of JSONs if multiple documents have been uploaded




<!-- USAGE -->
## Usage
1. Upload a document (or multiple) by clicking the '+' next to the 'Documents' section on the left panel
2. Create a new blank spaCy model by clicking 'Machine Learning' in the menu bar and then clicking 'Create Blank Model'
* If you already have a model that you want to use, you can skip this step
* If you already have a model that is fully trained, you may skip to step 12
3. Click 'Train' and then 'Load New Model' and select the model you would like to use
4. To train your model, you can start by clicking the '+' next to 'Labels'
5. From here, you will be prompted to enter a name for this category
6. By default, a highlight color will be generated at random
	- This can occasionally lead to an ugly color, in which case you can change the highlight color by clicking on the eyedropper and then selecting your preference
7. Finally, you can start highlighting
	- Double click or just click and drag to highlight
8. If you want to highlight a word again OR correct it, you can highlight again and a menu will prompt you as to whether you want to add a new highlight or delete the highlighted portion of the existing highlight
	- For shorthand usage, we added the ability to add an annotation that is already an annotation by holding down the 'a' key while highlighting
	- Likewise, for deleting, hold down 'd'
9. If you want to highlight by search, use the designated search bar
	- 'txt' denotes regular searching, clicking it will change to 're', denoting regex searching
	- The '>' below the search bar is a switch for the context of the search
		- 'Add' will highlight all of the instances of the searched word(s) while 'Delete' will do the very opposite
10. View the progress of your annotations by hovering over the right panel
	- Click an annotation to scroll to its position in the document
11. When finished annotating, select 'Train' and then you may either train the model using the current document only, or using all of the documents laoding by clicking on the rescpective button
  - You can download the condensed results as a JSON by hovering over 'Download' in the bottom left of the screen
	- Options include a .zip of all the open documents or just a singular .json of the current document
12. After training is complete, you can click 'Annotate' to annotate the current document or all documents loaded using their respective buttons




<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to be learn, inspire, and create. Any contributions you make are greatly appreciated.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request




<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE` for more information.




<!-- AUTHORS -->
## Authors
- Matthew Anthony
- Nicolas Gonzalez
- Keith Hudock
- Tony Mark
- Leo Vergnetti
- Qunchao Zhou
