import { Exo, Exo_2, Josefin_Sans, Marck_Script } from 'next/font/google';

export const josefine = Josefin_Sans({
    subsets: ['latin'],
    weight: ['400', '700'], // Use 'weight' instead of 'weights'
  });


export const exo = Exo(
    {
        subsets: ['latin'],
        weight: ['400', '700'],
    }
);

export const exo_2 = Exo_2(
    {
        subsets: ['latin'],
        weight: ['400', '700'],
    }
);

export const mark_script = Marck_Script(
    {
        subsets: ['latin'],
        weight: ['400'],
    }
)




