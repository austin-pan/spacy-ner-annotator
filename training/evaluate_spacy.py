import spacy
from spacy.gold import GoldParse
from spacy.scorer import Scorer
import json
from os import listdir
from os.path import isfile, join
import requests

from generate_train_data import load_data


# Get the performance statistics of an NER model on input testing data.
def evaluate(ner_model, examples):
    scorer = Scorer()
    for text, annot in examples:
        doc_gold_text = ner_model.make_doc(text)
        gold = GoldParse(doc_gold_text, entities = annot["entities"])
        pred_value = ner_model(text)
        scorer.score(pred_value, gold)
    return scorer.scores


# Get the predictions that an NER model makes on input testing data's text.
def get_predictions(ner_model, examples):
    preds = []
    for text, annot in examples:
        doc = ner_model(text)
        entities = [[ent.start_char, ent.end_char, ent.label_] for ent in doc.ents]
        preds.append((text, {"entities": entities}))
    return preds


# Load custom spaCy model
model_path = input("Enter your Model Name: ") # "custom_model_en_core_web_sm"
custom_nlp = spacy.load(model_path)
# Load base spaCy model (might have to install it using 'spacy download -m en_core_web_sm' in terminal)
default_nlp = spacy.load("en_core_web_sm")
# Load testing data
test_data_path = "test_annotations"
test_data = load_data(test_data_path)
# evaluate spaCy model performances
custom_eval = evaluate(custom_nlp, test_data)
default_eval = evaluate(default_nlp, test_data)

print("\n")
print("CUSTOM STATS")
print("precision:", custom_eval["ents_p"])
print("recall:", custom_eval["ents_r"])
print("f-score:", custom_eval["ents_f"])
print("per type:", custom_eval["ents_per_type"])
print("---")
print("DEFAULT STATS")
print("precision:", default_eval["ents_p"])
print("recall:", default_eval["ents_r"])
print("f-score:", default_eval["ents_f"])
print("per type:", default_eval["ents_per_type"])
print("\n")
