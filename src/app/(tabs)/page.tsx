'use client';
import { Modal } from '@/components/shared/modals/Modal';
import { Button } from '@/components/shared/buttons/Button';
import { useState } from 'react';
import { Select } from '@/components/shared/form-elements/selects/Select';

export default function HomePage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="text-xl">
      <Button onClick={() => setOpen(true)}>open</Button>
      <div>
        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Asperiores
        blanditiis consectetur debitis eligendi enim, esse ipsam ipsum mollitia
        natus odio odit quam qui quos reiciendis rerum sed vel voluptates.
        Dolorem eveniet impedit incidunt laudantium officia perspiciatis porro
        provident quod repudiandae sit unde, velit veritatis? Adipisci aliquid
        animi aspernatur atque, blanditiis dignissimos distinctio dolore dolores
        doloribus eius eos fuga fugiat fugit impedit iste labore laboriosam,
        libero magnam maxime minus molestiae nemo nihil numquam odio odit
        pariatur provident quaerat quas quasi qui quo quos reiciendis repellat
        temporibus tenetur voluptas, voluptatum. Alias cumque debitis, ipsa
        obcaecati officia quas quis? Ab consectetur illo inventore ipsam
        laudantium neque perferendis quis quisquam sed temporibus. Aspernatur,
        commodi cum cumque debitis numquam, officiis provident recusandae,
        reprehenderit sit totam vitae voluptas. Amet dicta earum, eum, ipsum
        modi molestiae mollitia nihil, nobis omnis provident quas sed temporibus
        vel voluptas voluptates? Alias asperiores at autem debitis dolore
        dolorem dolores esse excepturi illo ipsa ipsum laboriosam maxime
        molestias odio odit officia perspiciatis placeat provident quaerat quia
        quidem recusandae suscipit, tempora ut voluptates. Autem commodi dolor
        explicabo id maiores nisi omnis perferendis reprehenderit tempora ullam.
        Deserunt dignissimos est eum explicabo in numquam odio odit,
        perspiciatis quod sequi, vero voluptate. Ad adipisci alias asperiores
        assumenda blanditiis corporis culpa dignissimos distinctio dolores eos
        ex illum ipsa nam odio officia optio pariatur quidem quod reiciendis rem
        repudiandae sed tenetur veniam, veritatis voluptas voluptate voluptatem?
        Aliquid assumenda delectus deleniti dolor doloribus et expedita, fugiat
        fugit impedit inventore itaque minima quia quos reiciendis reprehenderit
        sapiente, similique. Animi architecto aspernatur, cum dicta distinctio
        dolorem dolorum eos, error esse est facere fugit illo impedit iure
        labore laboriosam magnam maiores minus modi molestiae natus nihil nobis
        omnis provident quaerat quas quibusdam quod repellat repellendus
        reprehenderit repudiandae sequi sit voluptates. Alias atque consequatur
        eius itaque minima, minus nostrum praesentium quam velit voluptates!
        <Select
          placeholder="Some text"
          options={[
            { value: 'apple', label: 'Apple 🍎' },
            { value: 'banana', label: 'Banana 🍌' },
            { value: 'orange', label: 'Orange 🍊' },
            { value: 'grape', label: 'Grape 🍇' },
            { value: 'kiwi', label: 'Kiwi 🥝' },
            { value: 'pear', label: 'Pear 🍐' },
            { value: 'strawberry', label: 'Strawberry 🍓' },
            { value: 'watermelon', label: 'Watermelon 🍉' },
            { value: 'pineapple', label: 'Pineapple 🍍' },
            { value: 'cherry', label: 'Cherry 🍒' },
            { value: 'mango', label: 'Mango 🥭' },
            { value: 'coconut', label: 'Coconut 🥥' },
            { value: 'peach', label: 'Peach 🍑' },
            { value: 'plum', label: 'Plum 🍑' },
            { value: 'lychee', label: 'Lychee 🍋' },
            { value: 'grapefruit', label: 'Grapefruit 🍇' },
            { value: 'avocado', label: 'Avocado 🥑 asdasdasdasdas' },
          ]}
        />
        <Select
          placeholder="Some text"
          options={[
            { value: 'apple', label: 'Apple 🍎' },
            { value: 'banana', label: 'Banana 🍌' },
            { value: 'orange', label: 'Orange 🍊' },
            { value: 'grape', label: 'Grape 🍇' },
            { value: 'kiwi', label: 'Kiwi 🥝' },
            { value: 'pear', label: 'Pear 🍐' },
            { value: 'strawberry', label: 'Strawberry 🍓' },
            { value: 'watermelon', label: 'Watermelon 🍉' },
            { value: 'pineapple', label: 'Pineapple 🍍' },
            { value: 'cherry', label: 'Cherry 🍒' },
            { value: 'mango', label: 'Mango 🥭' },
            { value: 'coconut', label: 'Coconut 🥥' },
            { value: 'peach', label: 'Peach 🍑' },
            { value: 'plum', label: 'Plum 🍑' },
            { value: 'lychee', label: 'Lychee 🍋' },
            { value: 'grapefruit', label: 'Grapefruit 🍇' },
            { value: 'avocado', label: 'Avocado 🥑 asdasdasdasdas' },
          ]}
        />{' '}
        <Select
          placeholder="Some text"
          options={[
            { value: 'apple', label: 'Apple 🍎' },
            { value: 'banana', label: 'Banana 🍌' },
            { value: 'orange', label: 'Orange 🍊' },
            { value: 'grape', label: 'Grape 🍇' },
            { value: 'kiwi', label: 'Kiwi 🥝' },
            { value: 'pear', label: 'Pear 🍐' },
            { value: 'strawberry', label: 'Strawberry 🍓' },
            { value: 'watermelon', label: 'Watermelon 🍉' },
            { value: 'pineapple', label: 'Pineapple 🍍' },
            { value: 'cherry', label: 'Cherry 🍒' },
            { value: 'mango', label: 'Mango 🥭' },
            { value: 'coconut', label: 'Coconut 🥥' },
            { value: 'peach', label: 'Peach 🍑' },
            { value: 'plum', label: 'Plum 🍑' },
            { value: 'lychee', label: 'Lychee 🍋' },
            { value: 'grapefruit', label: 'Grapefruit 🍇' },
            { value: 'avocado', label: 'Avocado 🥑 asdasdasdasdas' },
          ]}
        />{' '}
        <Select
          placeholder="Some text"
          options={[
            { value: 'apple', label: 'Apple 🍎' },
            { value: 'banana', label: 'Banana 🍌' },
            { value: 'orange', label: 'Orange 🍊' },
            { value: 'grape', label: 'Grape 🍇' },
            { value: 'kiwi', label: 'Kiwi 🥝' },
            { value: 'pear', label: 'Pear 🍐' },
            { value: 'strawberry', label: 'Strawberry 🍓' },
            { value: 'watermelon', label: 'Watermelon 🍉' },
            { value: 'pineapple', label: 'Pineapple 🍍' },
            { value: 'cherry', label: 'Cherry 🍒' },
            { value: 'mango', label: 'Mango 🥭' },
            { value: 'coconut', label: 'Coconut 🥥' },
            { value: 'peach', label: 'Peach 🍑' },
            { value: 'plum', label: 'Plum 🍑' },
            { value: 'lychee', label: 'Lychee 🍋' },
            { value: 'grapefruit', label: 'Grapefruit 🍇' },
            { value: 'avocado', label: 'Avocado 🥑 asdasdasdasdas' },
          ]}
        />
      </div>
      <Modal open={open} onClose={() => setOpen(false)} closeOnOverlayClick>
        <div className="h-[500px] rounded-lg p-6 bg-purple-gradient">
          <h3 className="text-lg font-semibold">Deactivate Account</h3>
          <p className="mt-2 text-sm text-gray-400">
            Are you sure you want to deactivate your account? This action cannot
            be undone.
          </p>
          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={() => setOpen(false)}
              className="rounded-md bg-red-500 px-3 py-2 text-sm font-semibold text-white hover:bg-red-400"
            >
              Deactivate
            </button>
            <button
              onClick={() => setOpen(false)}
              className="rounded-md bg-gray-secondary px-3 py-2 text-sm font-semibold text-white hover:bg-white/20"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
      Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ab adipisci
      aliquid architecto debitis delectus distinctio dolor dolorum ducimus eaque
      eius fuga fugit id in ipsa laborum libero magnam natus necessitatibus
      neque, quas quos reiciendis repellendus saepe sed sequi ullam ut velit.
      Accusamus ad adipisci cumque debitis enim eos expedita explicabo id
      itaque, laboriosam maxime necessitatibus nemo, neque perferendis quam qui
      quod rem repellendus sequi soluta? Accusamus alias ea excepturi
      exercitationem, placeat quas rem voluptas! Animi at, aut commodi cum
      dignissimos dolorum ea eum exercitationem facilis illum ipsam iusto
      molestiae natus nemo nobis obcaecati officiis porro provident saepe sed
      tempora. Aperiam, cupiditate, dicta doloremque earum hic inventore
      laboriosam nobis, quae quam quia quisquam repellat reprehenderit saepe
      sint sint temporibus vel veniam voluptatum. Asperiores beatae consectetur
      delectus eaque fuga illo nisi nostrum optio placeat quaerat quod
      recusandae reiciendis sequi sint, voluptas. Atque illum impedit in
      incidunt nisi vitae? Cupiditate deleniti et eum ipsum iusto,
      necessitatibus officiis porro repellat. Ad aliquid amet assumenda culpa
      dolore dolorum ducimus ea earum eum exercitationem facilis fuga harum
      iusto modi, molestiae natus nemo nisi nostrum placeat porro possimus
      provident quibusdam quo repellendus repudiandae rerum voluptas. Assumenda
      at aut cupiditate doloremque dolores ea eius enim eveniet expedita facere
      fugiat harum id incidunt iste iure laboriosam maiores maxime minima minus
      modi molestiae natus nulla quia quo sed sequi ut vitae voluptatibus!
      Architecto commodi consequuntur cupiditate debitis deleniti dolore dolorem
      ducimus eaque error excepturi harum impedit ipsa ipsam laborum magnam
      nesciunt nostrum optio, placeat porro quia quibusdam reiciendis repellat
      rerum soluta voluptatum. At, autem, eligendi error fuga id iure minus
      natus numquam officia perspiciatis qui quis? Ad amet assumenda culpa
      dolore dolores expedita harum, id itaque iure laboriosam necessitatibus
      nemo nobis obcaecati officiis porro provident saepe sed tempora. Aperiam,
      cupiditate, dicta doloremque earum hic inventore laboriosam nobis, quae
      quam quia quisquam repellat reprehenderit saepe sint temporibus vel veniam
      voluptatum. Asperiores beatae consectetur delectus eaque fuga illo nisi
      optio reiciendis rem voluptatum. A adipisci aliquid amet aperiam at
      corporis culpa dolorem dolorum ducimus ea eligendi eos et eum eveniet
      facilis, fuga harum illum in iste iure laborum laudantium magni minima
      minus modi nesciunt nisi nobis nostrum odio perspiciatis porro quidem
      rerum, sapiente sint tempora tenetur voluptatem. Dignissimos ea facilis
      fugiat id incidunt, laborum odit, provident quaerat quod reprehenderit
      sunt velit. Aliquid animi aspernatur aut deleniti dicta dolores eos
      explicabo ipsam laborum maiores maxime modi molestias nemo non, quaerat,
      quibusdam quisquam quod quos recusandae reiciendis sequi sint, voluptas.
      Atque illum impedit in incidunt nisi vitae? Cupiditate deleniti et eum
      ipsum iusto, necessitatibus officiis pariatur porro repellat. Ad aliquid
      animi commodi iusto repudiandae. Aperiam architecto aspernatur blanditiis
      commodi expedita explicabo facilis fuga harum iusto modi, molestiae natus
      nemo nisi omnis praesentium, provident quasi quisquam recusandae
      reprehenderit rerum tempora velit voluptatem. At dolore, esse eveniet
      inventore iusto quaerat quia sunt. Accusamus accusantium ad aliquid
      architecto at dicta dignissimos earum eius eveniet fugiat incidunt
      molestiae, nemo neque nisi perspiciatis praesentium quaerat quod
      recusandae vero voluptatibus. Adipisci beatae consequatur cupiditate
      doloremque, enim fugiat maxime odit quam quasi quis, repellendus
      similique, ullam vitae. Accusantium ad aliquam, aliquid assumenda autem
      consectetur consequatur cumque dolore dolorem enim esse excepturi expedita
      hic impedit inventore maxime nam nisi nostrum placeat porro possimus
      provident quibusdam quo repellendus repudiandae rerum voluptas. Assumenda
      aut cupiditate doloremque et ex facilis fugit libero magnam, magni nobis
      nulla, odit optio praesentium quae, quam quia quibusdam quis quo
      reprehenderit sed tempore vitae voluptates. A alias aliquid assumenda
      consectetur deleniti eligendi iste maiores nam odit possimus, provident
      qui, rem saepe soluta sunt tenetur totam unde vitae voluptas,
      voluptatibus! Ad animi aspernatur assumenda aut beatae blanditiis
      consequuntur, debitis dignissimos dolorum ea earum enim excepturi expedita
      explicabo harum iste libero magni minima nisi nostrum perspiciatis quae
      quibusdam, ratione recusandae tempore. Et id illo ipsum possimus, sint
      sunt unde voluptates? Ad deleniti eius eligendi ex expedita, impedit
      maiores molestiae. Architecto at commodi, consequatur consequuntur
      deserunt dolor dolorum fugiat ipsam iusto, minima necessitatibus nesciunt
      officia officiis quidem quo reiciendis repudiandae saepe sit, ut
      voluptate? Aliquam autem blanditiis consectetur consequuntur distinctio
      dolore dolorum ea earum, est exercitationem expedita fugit illo itaque
      labore libero officia provident quia, rem sequi sint soluta tenetur
      voluptatum! Animi deleniti dicta distinctio esse maxime modi molestiae
      officia quasi qui, recusandae, veniam, voluptatibus! At aut, blanditiis
      consequatur culpa doloremque id inventore laborum, libero minus nobis
      officia officiis, praesentium quaerat quam qui quisquam quo vel. Debitis
      eveniet illum molestias quibusdam voluptatem? Alias, asperiores
      consectetur corporis, dolorem earum ex labore molestiae nihil numquam
      pariatur quasi recusandae soluta ullam vel voluptatibus! A adipisci
      aliquid architecto consequatur corporis culpa distinctio, dolore ea eaque
      eligendi eveniet exercitationem expedita harum incidunt itaque iure
      laudantium nesciunt, nihil nostrum perferendis possimus provident quam
      quas qui quisquam quos ratione repellat sapiente sed sit tempora totam
      ullam unde vel velit voluptates voluptatum. Amet autem commodi deleniti
      dignissimos dolore, error esse, et exercitationem facilis illo laborum
      magni nostrum obcaecati porro reprehenderit, totam voluptas? Est itaque
      mollitia nisi non numquam quaerat quia quibusdam voluptate. Asperiores
      assumenda cupiditate debitis deserunt dignissimos error eum fugiat fugit
      hic illum, impedit ipsum magni natus nemo nisi possimus quae quasi rem
      saepe sed, similique totam vero voluptatum! Ab adipisci beatae dolore
      eligendi enim est, eum facere harum labore minus nihil nobis praesentium
      sed suscipit ut vel voluptate. Doloribus eos et ex excepturi in laboriosam
      nostrum ullam! Atque blanditiis eveniet nam velit! Dignissimos doloremque
      ea excepturi facere fugiat nemo perferendis recusandae! A ab accusamus
      accusantium amet asperiores culpa cum cupiditate delectus dolor dolores
      eveniet inventore ipsum iure laudantium libero natus nemo odit
      perferendis, possimus quam quidem, rem soluta ullam ut velit veniam
      voluptate. Aperiam, aut error est illum molestiae nostrum quasi temporibus
      totam? Aspernatur consectetur consequuntur corporis ea in, incidunt,
      maiores odio perferendis praesentium repudiandae sapiente vero vitae! A ab
      asperiores aut beatae consequatur corporis debitis eaque eius ipsam iste
      laboriosam, libero magni maiores molestiae natus necessitatibus officia
      optio placeat praesentium quos reiciendis vel voluptatem. Architecto
      aspernatur cum dolorem earum eveniet excepturi iste minus quod unde. A
      accusamus aspernatur distinctio dolores ipsam minus quaerat quia
      reprehenderit sequi, suscipit? Aut delectus dolorum ea est eum, excepturi
      explicabo, fuga hic id in itaque nisi, optio quia rerum tenetur! Dolorem
      eius et expedita inventore voluptates! A culpa debitis ea expedita facilis
      fuga impedit laborum nulla similique voluptatibus? Ab, animi autem,
      deleniti impedit laboriosam maxime mollitia non perferendis quis ratione
      rem sint sunt tempore totam vel! Accusantium dolorum ducimus fugiat fugit
      laborum omnis repellat vel veniam! Ad adipisci aliquam, atque beatae
      consequuntur eius laborum molestiae nemo nostrum numquam odio odit
      perspiciatis possimus quo sed similique voluptate! Ab ad aliquam
      aspernatur beatae cumque deleniti dolor dolore earum enim eum
      exercitationem facere iste iusto labore laboriosam laborum maiores modi
      nemo nesciunt, nisi officia possimus quaerat quasi qui quibusdam sed sint
      temporibus vel voluptatem voluptatibus. In, ipsa quibusdam. Eius,
      repellendus?
    </div>
  );
}
