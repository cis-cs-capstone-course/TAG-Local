import json
import os
import argparse
import sys
import random
from pathlib import Path
import spacy
import re
import string
from spacy.util import minibatch, compounding

class documentClass:
    def __init__(self, title, text, annotations):
        self.title = title
        self.text = text
        self.annotations = annotations

class annotationClass:
    def __init__(self, label, start, end, content):
        self.range = {'startPosition': start, 'endPosition': end}
        self.content = content
        self.label = label


def main(model, raw_data):
    data = json.loads(raw_data)
    nlp = spacy.load(model)
    print("Loaded model '%s'" % model)
    docs = []
    for d in data:
        doc = nlp(d['text'])
        returnData = []
        for ent in doc.ents:
            annotation = annotationClass(ent.label_, ent.start_char, ent.end_char, ent.text)
            print("Found entity: %s in %s" % (ent.text, d['title']))
            sys.stdout.flush()
            returnData.append(annotation.__dict__)
        docs.append(documentClass(d['title'], d['text'], returnData).__dict__)
        # print("Found %d entities", doc.ents.count)
    with open('data.json', 'w') as outfile:
        json.dump(docs, outfile)

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument(
        '--model_path',
        help="path to ML model"
    )
    parser.add_argument(
        '--data_path',
        help="Path to the data directory."
    )


args = parser.parse_args()
print("args parsed")
print(args)
sys.stdout.flush()
main(args.model_path, args.data_path)
