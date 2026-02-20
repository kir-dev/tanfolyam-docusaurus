import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Layout from '@theme/Layout';

const CourseList = [
  {
    title: 'Webes alapok',
    link: '/docs/webes-alapok/intro',
    logo: '/img/html-logo.svg',
    description:
      'A tanfolyamon ismerkedhettek a modern szoftverfejlesztési módszerekekkel és technikákkal, valamint a elsajátíthatjátok webfejlesztés alapjait, és megismerkedhettek a web működésével, a HTML, JavaScript és a CSS nyelvek világával. \n Emellett bevezetést kaphattok a git működésébe és gyakorlati használatába, lehetővé téve munkátok gyorsabb és hatékonyabb elvégzését.',
  },
  {
    title: 'Node.js',
    link: '/docs/node-js/intro',
    logo: '/img/node-js-logo.svg',
    description:
      'NodeJS tanfolyamon megismerkedhettek a TypeScript nyelvvel, a NestJS keretrendszerrel. A tanfolyam során felépítünk egy ticket management site-ot, amelyet folytatólagosan a React tanfolyamon fogjátok gyönyörű UI-jal feldobni.',
  },
  {
    title: 'SpringBoot + Kotlin',
    link: '/docs/spring-boot/intro',
    logo: '/img/spring-boot-logo.svg',
    description:
      'Spring Boot és Kotlin előadásokon betekintést nyerhettek egy izgalmas nyelv, illetve egy elterjedt és modern keretrendszer alapjaiba, amellyel akár enterprise minőségű appokat is képesek lesztek fejleszteni. A tanfolyam után adott a lehetőség az SCH-Pincérbe és a CMSch franchise projektekbe való becsatlakozásra. CMSch rendszerünket a közélet rengeteg eseményén megfuttatuk már.',
  },
  {
    title: 'React',
    link: '/docs/react/intro',
    logo: '/img/react-logo.svg',
    description:
      'HTML, CSS és TypeScript tudásunk felhasználásával megismerkedünk az egyik legnépszerűbb frontend keretrendszerrel, a ReactJS-szel, amellyel gyorsan, átláthatóan és stabilan leszünk képesek webes alkalmazásokat fejleszteni. A ReactJS alapjainak bemutatása és gyakorlati alkalmazása mellett megismerkedünk számos hasznos könyvtárral, praktikával és tudással is.',
  },
];

export default function HomePage() {
  return (
    <Layout title='Kir-Dev tanfolyamweb'>
      <header className='hero hero--primary' style={{ padding: '4rem 0' }}>
        <div className='container text--center'>
          <h1 className='hero__title'>Üdvözlünk a Kir-Dev tanfolyam weboldalán!</h1>
          <p className='hero__subtitle'>Tanfolyamok és segédanyagok egy helyen</p>
        </div>
      </header>

      <main className='container' style={{ marginTop: '6rem', marginBottom: '6rem' }}>
        <div className='row'>
          {CourseList.map((course, idx) => (
            <div key={idx} className='col col--6 margin-bottom--lg'>
              <div className='card shadow--md' style={{ height: '100%', flexDirection: 'column', display: 'flex' }}>
                <div className='card__body'>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.8rem' }}>
                    <div style={{ flexShrink: 0 }}>
                      <img
                        src={useBaseUrl(course.logo)}
                        alt={course.title}
                        style={{ width: '60px', height: '60px' }}
                      ></img>
                    </div>
                    <div style={{ flexGrow: 1 }}>
                      <h3 style={{ fontSize: '2rem' }}>{course.title}</h3>
                      <p style={{ whiteSpace: 'pre-line', fontSize: '1rem', lineHeight: '1.5', textAlign: 'justify' }}>
                        {course.description}
                      </p>
                    </div>
                  </div>
                </div>
                <div className='card__footer' style={{ marginTop: 'auto' }}>
                  <Link className='button button--secondary button--block' to={course.link}>
                    Irány a tanfolyamhoz!
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </Layout>
  );
}
