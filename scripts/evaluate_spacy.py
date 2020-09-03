import spacy
from spacy.gold import GoldParse
from spacy.scorer import Scorer
import json
from os import listdir
from os.path import isfile, join

from train import load_data


def evaluate(ner_model, examples):
    scorer = Scorer()
    for input_, annot in examples:
        doc_gold_text = ner_model.make_doc(input_)
        gold = GoldParse(doc_gold_text, entities = annot["entities"])
        pred_value = ner_model(input_)
        scorer.score(pred_value, gold)
    return scorer.scores


def spacy_misses(ner_model, examples):
    for input_, annot in examples:
        doc = ner_model(input_)
        entities = []
        missed = False
        for ent in doc.ents:
            entity = [ent.start_char, ent.end_char, ent.label_]
            if entity not in annot['entities']:
                missed = True
            entity.append(ent.text)
            entities.append(entity)

        if missed:
            print(input_, "\npreds:", entities, "\nannot:", [a + [input_[a[0]:a[1]]] for a in annot['entities']])
            print("")


model_path = input("Enter your Model Name: ")
custom_nlp = spacy.load(model_path)

default_nlp = spacy.load("en_core_web_sm")

test_data_path = "test_annotations"
test_data = load_data(test_data_path)

custom_eval = evaluate(custom_nlp, test_data)
default_eval = evaluate(default_nlp, test_data)

print("custom stats")
print("precision:", custom_eval["ents_p"])
print("recall:", custom_eval["ents_r"])
print("f-score:", custom_eval["ents_f"])
print("per type:", custom_eval["ents_per_type"])
print("---")
print("default stats")
print("precision:", default_eval["ents_p"])
print("recall:", default_eval["ents_r"])
print("f-score:", default_eval["ents_f"])
print("per type:", default_eval["ents_per_type"])

# spacy_misses(custom_nlp, test_data)