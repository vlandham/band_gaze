import os
import json
import argparse
import PIL

from PIL import ImageDraw


CUR_DIR = os.path.dirname(os.path.realpath(__file__))

def import_data(filename):
    data = []
    with open(filename) as json_data:
        data = json.load(json_data)
    return data


def mkdirp(a_dir):
    if not os.path.isdir(a_dir):
        os.mkdir(a_dir)

def rec(xy, size = 6):
    return [(xy['x'] - (size / 2), xy['y'] - (size / 2)), (xy['x'] + (size / 2), xy['y'] + (size / 2))]

def plotEye(pimage, lmarks, eye = 'left'):
    draw = ImageDraw.Draw(pimage)
    base_features = ['Bottom', 'Top', 'Inner', 'Outer']
    prefix = 'eyeLeft'
    pupil = 'pupilLeft'
    if eye == 'right':
        prefix = 'eyeRight'
        pupil = 'pupilRight'
    features = [prefix + f for f in base_features]
    for f in features:
        #print(f)
        #print(lmarks)
        draw.rectangle(rec(lmarks[f]), fill = 'red')

    draw.rectangle(rec(lmarks[pupil]), fill = 'blue')
    return pimage

def plotEyes(pimage, lmarks):
    pimage = plotEye(pimage, lmarks, eye = 'left')
    pimage = plotEye(pimage, lmarks, eye = 'right')
    return pimage

def mark_image(pimage, face):
    lmarks = face['faceLandmarks']
    return plotEyes(pimage, lmarks)

def extract_sub_image(pimage, rec):
    pil_rec = (rec['left'], rec['top'], rec['left'] + rec['width'], rec['top'] + rec['height'])
    return pimage.crop(pil_rec)

def save_image(pimage, output_file):
    pimage.save(output_file)

def get_image(cat, artist):
    artist_img_file = os.path.join(CUR_DIR, 'data', 'imgs', cat['id'], artist['id'] + '.jpg')
    if not os.path.isfile(artist_img_file):
        return None
    return PIL.Image.open(artist_img_file)

def extract_faces(cat, artist, output_dir, args):
    faces_count = len(artist['faces'])
    pimage = get_image(cat, artist)
    # exit early if there are no faces to extract
    if faces_count == 0:
        return None
    elif not pimage:
        return None
    else:
        index = 0
        output_dir = os.path.join(output_dir, cat['id'])
        mkdirp(output_dir)
        for face in artist['faces']:
            if 'faceLandmarks' not in face:
                return None

            if args.mark:
                pimage = mark_image(pimage, face)

            output_file = os.path.join(output_dir, artist['id'] + '_' + str(index) + '.jpg')

            faceimg = extract_sub_image(pimage, face['faceRectangle'])
            save_image(faceimg, output_file)
            index += 1

    return True



def main(input_file, output_dir, args):
    cats = import_data(input_file)
    mkdirp(output_dir)
    missing = {}
    counts = {}
    for cat in cats:

        cat_id = cat['id']
        missing[cat_id] = 0
        counts[cat_id] = 0
        print(cat_id)
        for artist in cat['artist_details']:
            rtn = extract_faces(cat, artist, output_dir, args)
            if not rtn:
                missing[cat_id] += 1
            counts[cat_id] += 1
    print(missing)
    print(counts)


parser = argparse.ArgumentParser(description='Generate feature matrices.')
parser.add_argument('--input', default=os.path.join(CUR_DIR, './data/faces.json'))
parser.add_argument('--output', default=os.path.join(CUR_DIR, './data/imgs_out'))

parser.add_argument('--mark', dest='mark', action='store_true')
parser.add_argument('--no-mark', dest='mark', action='store_false')
parser.set_defaults(mark=False)

args = parser.parse_args()

main(args.input, args.output, args)
