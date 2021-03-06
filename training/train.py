import spacy
import spacy.lookups
import random
import json
from os import listdir
from os.path import isfile, join

from generate_train_data import load_data


# Train custom spaCy model on 'train_data' on top of 'model' using 'iteration' number of iterations.
def train_spacy(train_data, iterations=20, model=None):
    if model is not None:
        nlp = spacy.load(model)  # load existing spaCy model
        print("Loaded model '%s'" % model)
    else:
        nlp = spacy.blank("en")  # create blank Language class
        print("Created blank 'en' model")

    # create the built-in pipeline components and add them to the pipeline
    # nlp.create_pipe works for built-ins that are registered with spaCy
    if 'ner' not in nlp.pipe_names:
        ner = nlp.create_pipe('ner')
        nlp.add_pipe(ner, last=True)
    else:
        ner = nlp.get_pipe("ner")
       

    # add labels
    for _, annotations in train_data:
        for ent in annotations.get('entities'):
            ner.add_label(ent[2])

    # get names of other pipes to disable them during training
    other_pipes = [pipe for pipe in nlp.pipe_names if pipe != 'ner']
    with nlp.disable_pipes(*other_pipes):  # only train NER
        optimizer = nlp.begin_training()
        for itn in range(iterations):
            print("Starting iteration " + str(itn))
            random.shuffle(train_data)
            losses = {}
            for text, annotations in train_data:
                nlp.update(
                    [text],  # batch of texts
                    [annotations],  # batch of annotations
                    drop=0.2,  # dropout - make it harder to memorise data
                    sgd=optimizer,  # callable to update weights
                    losses=losses)
            print("Losses", losses)
    return nlp


# Train model and save it to disk
if __name__ == "__main__":
    data_path = "data_annotations"
    train_data = load_data(data_path)

    models = [None, "en_core_web_sm"]
    model = models[1]
    prdnlp = train_spacy(train_data, 20, model)

    # Save our trained Model
    modelfile = input("Enter your Model Name: ")
    # if model is None:
    #     model = "blank"
    # modelfile = "custom_model_" + model
    prdnlp.to_disk(modelfile)
    print("saved model:", modelfile)
    