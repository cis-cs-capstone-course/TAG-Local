import json
import argparse
import sys
import spacy


class DocumentClass:
    def __init__(self, title, text, annotations):
        self.title = title
        self.text = text
        self.annotations = annotations


class AnnotationClass:
    def __init__(self, label, start, end, content):
        self.range = {'startPosition': start, 'endPosition': end}
        self.content = content
        self.label = label


def main(model, raw_data):
    data = json.loads(raw_data)
    nlp = spacy.load(model)
    print("Loaded model from: '%s'" % model)
    docs = []
    for d in data:
        doc = nlp(d['text'])
        return_data = []
        for ent in doc.ents:
            annotation = AnnotationClass(ent.label_, ent.start_char, ent.end_char, ent.text)
            print("Found entity: %s in %s" % (ent.text, d['title']))
            sys.stdout.flush()
            return_data.append(annotation.__dict__)
        docs.append(DocumentClass(d['title'], d['text'], return_data).__dict__)
        # print("Found %d entities", doc.ents.count)
    with open('data.json', 'w') as outfile:
        json.dump(docs, outfile)


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument(
        '--model',
        help="path to ML model"
    )
    parser.add_argument(
        '--raw_data',
        help="Path to the data directory."
    )


args = parser.parse_args()
print("args parsed")
print(args)
sys.stdout.flush()
main(args.model, args.raw_data)
