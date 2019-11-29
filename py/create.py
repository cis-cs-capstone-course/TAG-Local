import argparse
import sys
from pathlib import Path
import spacy
from spacy.util import minibatch, compounding

train_data = []


def main(model_path):
    nlp = spacy.blank("en")  # create blank Language class
    print("Created blank 'en' model")
    sys.stdout.flush()
    # optimizer = nlp.begin_training()
    if "ner" not in nlp.pipe_names:
        ner = nlp.create_pipe("ner")
        nlp.add_pipe(ner)

    optimizer = nlp.begin_training()
    # move_names = list(ner.move_names)
    other_pipes = [pipe for pipe in nlp.pipe_names if pipe != "ner"]

    with nlp.disable_pipes(*other_pipes):  # only train NER
        sizes = compounding(1.0, 4.0, 1.001)
        batches = minibatch(train_data, size=sizes)
        losses = {}
        for batch in batches:
            texts, annotations = zip(*batch)
            nlp.update(texts, annotations, sgd=optimizer, drop=0.35, losses=losses)

    # save model
    output_dir = Path(model_path)

    if not output_dir.exists():
        output_dir.mkdir()
        nlp.to_disk(output_dir)
        print("Saved model to: ", output_dir)
        sys.stdout.flush()
        return 0
    else:
        print("Model already exists!")
        return 1


if __name__ == '__main__':
    parser = argparse.ArgumentParser()

    parser.add_argument(
        '--model_path',
        help="Path for model to be created."
    )

    args = parser.parse_args()
    print("args parsed")
    print(args)
    sys.stdout.flush()

    main(args.model_path)
