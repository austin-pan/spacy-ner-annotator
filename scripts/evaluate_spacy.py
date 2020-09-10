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


# Print the misses in predictions that an NER model makes on input testing data.
def spacy_misses(ner_model, examples):
    for text, annot in examples:
        doc = ner_model(text)
        entities = []
        missed = False
        for ent in doc.ents:
            entity = [ent.start_char, ent.end_char, ent.label_]
            if entity not in annot['entities']:
                missed = True
            entity.append(ent.text)
            entities.append(entity)

        if missed:
            print(text, "\npreds:", entities, "\nannot:", [a + [text[a[0]:a[1]]] for a in annot['entities']], "\n")


# Get the predictions that an NER model makes on input testing data's text.
def get_predictions(ner_model, examples):
    preds = []
    for text, annot in examples:
        doc = ner_model(text)
        entities = [[ent.start_char, ent.end_char, ent.label_] for ent in doc.ents]
        preds.append((text, {"entities": entities}))
    return preds


# Get the performance statistics of an NER model's predictions in comparison to its input testing data.
def analyze_predictions(preds, examples):
    example_ents = [annot["entities"] for text, annot in examples]
    pred_ents = [annot["entities"] for text, annot in preds]

    num_actual = sum(len(e) for e in example_ents)
    num_preds = sum(len(e) for e in pred_ents)

    num_orgs = sum(len([ent for ent in e if ent[2] == "ORG"]) for e in example_ents)
    num_org_preds = sum(len([ent for ent in e if ent[2] == "ORG"]) for e in pred_ents)

    num_pers = sum(len([ent for ent in e if ent[2] == "PERSON"]) for e in example_ents)
    num_pers_preds = sum(len([ent for ent in e if ent[2] == "PERSON"]) for e in pred_ents)

    num_matches = 0
    org_matches = 0
    pers_matches = 0
    for text, annot in examples:
        for i, a in preds:
            if text == i:
                entities = annot['entities']
                predictions = a['entities']

                matches = [pred for pred in predictions if (pred in entities)]
                num_matches += len(matches)
                org_matches += sum(m[2] == "ORG" for m in matches)
                pers_matches += sum(m[2] == "PERSON" for m in matches)
                break

    num_matches *= 100
    org_matches *= 100
    pers_matches *= 100
    return({"precision": num_matches / num_preds, "recall": num_matches / num_actual,
        "ents_per_type": {"ORG": {"p": org_matches / num_org_preds, "r": org_matches / num_orgs}, "PERSON": {"p": pers_matches / num_pers_preds, "r": pers_matches / num_pers}}})


# Dedupe annotation coreferences to try to only keep full entity annotations.
def get_full_entities(data):
    ref_text = []
    coref_text = ["Securities and Futures Commision", "SFC", "Alan Linning", "Polly Lo", "Western Magistracy", "Eastern Magistracy", "Court of First Instance", "Securities and Futures Appeals Tribunal", "SFAT", "Court of Final Appeals", "CFA", "The Stock Exchange of Honk Kong Limited", "HKEx", "Market Misconduct Tribunal", "Court of Appeal", "Hong Kong Exchanges and Clearing Limited"]
    for text, annot in data:
        ents = sorted(annot['entities'], key=lambda x: len(x), reverse=True)

        full_ents = []
        for e in ents:
            ent_text = text[e[0]:e[1]]

            has_paren = (e[0] > 0 and text[e[0] - 1] == "(") and (e[1] < len(text) and text[e[1]] == ")")
            if any(map(lambda x: (ent_text in x) and (ent_text != x), ref_text)) or (ent_text in coref_text) or has_paren:
                # print(ent_text)
                if has_paren:
                    coref_text.append(ent_text)
                continue

            ref_text.append(ent_text)
            full_ents.append(e)

        annot['entities'] = full_ents
    return data


# A fuzzy version of the 'in' function to check if all tokens of 'word' exist in at least one element in 'word_list'.
def fuzzy_in(word, word_list):
    tokens = word.split(" ")
    for w in word_list:
        if all(t in w for t in tokens):
            return w
    return None


# Count coverage of NER performance
def fuzzy_match_docs(ner_model, db):
    matches = 0
    org_matches = 0
    pers_matches = 0
    for d in db:
        entities = set(map(lambda x: x.lower(), d["known_entities"].split("|")))
        entity_types = requests.post("https://dev-entityservice2.mtv.quantifind.com:8000/v1/name/predictEntityType", json={"names": list(entities), "settings": {"orgTokenExceptions": ["law"], "numTokensUpperBound": 5}}).json()
        text = d["article_body"]

        predictions = get_full_entities(get_predictions(ner_model, [(text, entities)]))[0]
        predicted_entities = set([text[e[0]:e[1]].lower() for e in predictions[1]["entities"]])

        for i, e in enumerate(entities):
            fuzzy = fuzzy_in(e, predicted_entities)
            if fuzzy != None:
                if entity_types[i]["prediction"] == "person":
                    pers_matches += 1
                else:
                    org_matches += 1
                matches += 1
                predicted_entities.remove(fuzzy)
    return {"Total": matches, "ORG": org_matches, "PERSON": pers_matches}


# Load custom spaCy model
model_path = "custom_model_en_core_web_sm" # input("Enter your Model Name: ")
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

# Find performance of full entity annotations
preds = get_predictions(custom_nlp, test_data)
stats = analyze_predictions(preds, test_data)
print("DEDUPED STATS")
print(stats)
print("\n")

### BELOW CODE IS ONLY RELEVANT TO SFC
is_sfc = False
if is_sfc:
    # Print spaCy NER model misses
    spacy_misses(custom_nlp, test_data)

    # Count coverage of NER model on SFC known entities
    with open("known_entities.json") as file:
        db = json.load(file)

    matches = fuzzy_match_docs(custom_nlp, db)
    print("num known entities matched using CUSTOM MODEL:", matches)
    matches = fuzzy_match_docs(default_nlp, db)
    print("num known entities matched using DEFAULT MODEL:", matches)
