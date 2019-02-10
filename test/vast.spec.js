import Vast from '../src/lib/vast'
import * as fs from 'fs'
import * as process from 'process'

describe('Basic Vast class functions', () => {
  it('it can be instantiated with a string', () => {
    const vast = new Vast({xml: ''})
  });

  it('it can be instantiated with a url', () => {
    const vast = new Vast({ url: 'https://ad.doubleclick.net/ddm/pfadx/N884.154386.EATER.COM/B21643693.231589573;sz=0x0;ord=[timestamp];dc_lat=;dc_rdid=;tag_for_child_directed_treatment=;tfua=;dcmt=text/xml'})
  });

  it('raises an error if url or xml is not set', () => {
    expect(() => {
      const vast = new Vast()
    }).toThrow(TypeError)
  })

  it('handles valid xml and parses it', () => {
    const xmlString = fs.readFileSync('./test/fixtures/vast.xml')
    const vast = new Vast({ xml: xmlString })
    vast.parse();
  })
});

describe('Vast Videos', () => {
  let xmlString

  beforeEach(()=> {
    xmlString = fs.readFileSync('./test/fixtures/vast.xml')
  })

  it('can return a list of video files', () => {
    const vast = new Vast({xml: xmlString})
    const videos = vast.videos()
    expect(videos.length).toBe(11);
  })

  it('a video file knows its height and width', () => {
    const vast = new Vast({ xml: xmlString })
    const video = vast.videos()[0]
    expect(video.height()).toBe(360);
    expect(video.width()).toBe(640);
  })
});
