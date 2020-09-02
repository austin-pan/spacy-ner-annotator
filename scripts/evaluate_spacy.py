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


def test_spacy(text):
	print("custom:")
	doc = custom_nlp(text)
	for ent in doc.ents:
		print(ent.text, ent.start_char, ent.end_char, ent.label_)

	print("")
	print("blank:")
	doc = blank_nlp(text)
	for ent in doc.ents:
		print(ent.text, ent.start_char, ent.end_char, ent.label_)


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
print("---")
print("default stats")
print("precision:", default_eval["ents_p"])
print("recall:", default_eval["ents_r"])
print("f-score:", default_eval["ents_f"])