import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:url_launcher/url_launcher.dart';

void main() {
  runApp(const ExattaApp());
}

const _bg = Color(0xFF070B12);
const _surface = Color(0xFF111827);
const _surface2 = Color(0xFF172235);
const _line = Color(0x1AFFFFFF);
const _text = Color(0xFFF5F8FF);
const _muted = Color(0xFF9AA7BD);
const _blue = Color(0xFF2F80ED);
const _cyan = Color(0xFF22D3EE);
const _green = Color(0xFF23C981);

class ExattaApp extends StatelessWidget {
  const ExattaApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Exatta Tech',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        brightness: Brightness.dark,
        scaffoldBackgroundColor: _bg,
        colorScheme: ColorScheme.fromSeed(
          seedColor: _cyan,
          brightness: Brightness.dark,
          surface: _surface,
        ),
        fontFamily: 'Roboto',
      ),
      home: const AppLoader(),
    );
  }
}

class AppLoader extends StatefulWidget {
  const AppLoader({super.key});

  @override
  State<AppLoader> createState() => _AppLoaderState();
}

class _AppLoaderState extends State<AppLoader> {
  late final Future<AppData> _dataFuture = AppData.load();

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<AppData>(
      future: _dataFuture,
      builder: (context, snapshot) {
        if (snapshot.hasError) {
          return ErrorScreen(error: snapshot.error.toString());
        }
        if (!snapshot.hasData) {
          return const Scaffold(
            body: Center(child: CircularProgressIndicator(color: _cyan)),
          );
        }
        return ExattaShell(data: snapshot.data!);
      },
    );
  }
}

class ExattaShell extends StatefulWidget {
  const ExattaShell({super.key, required this.data});

  final AppData data;

  @override
  State<ExattaShell> createState() => _ExattaShellState();
}

class _ExattaShellState extends State<ExattaShell> {
  int _index = 0;

  @override
  Widget build(BuildContext context) {
    final pages = [
      HomeScreen(data: widget.data, onSelect: _select),
      CentralScreen(data: widget.data),
      ProductsScreen(data: widget.data),
      const ContactScreen(),
    ];
    return Scaffold(
      extendBody: true,
      body: pages[_index],
      bottomNavigationBar: SafeArea(
        child: Container(
          margin: const EdgeInsets.fromLTRB(16, 0, 16, 14),
          decoration: BoxDecoration(
            color: _surface.withValues(alpha: .92),
            border: Border.all(color: _line),
            borderRadius: BorderRadius.circular(24),
            boxShadow: const [
              BoxShadow(
                color: Colors.black45,
                blurRadius: 28,
                offset: Offset(0, 14),
              ),
            ],
          ),
          child: NavigationBar(
            height: 66,
            selectedIndex: _index,
            backgroundColor: Colors.transparent,
            indicatorColor: _cyan.withValues(alpha: .16),
            labelTextStyle: WidgetStateProperty.resolveWith(
              (states) => TextStyle(
                color: states.contains(WidgetState.selected) ? _cyan : _muted,
                fontSize: 12,
                fontWeight: FontWeight.w700,
              ),
            ),
            onDestinationSelected: _select,
            destinations: const [
              NavigationDestination(
                icon: Icon(Icons.home_outlined),
                selectedIcon: Icon(Icons.home),
                label: 'Início',
              ),
              NavigationDestination(
                icon: Icon(Icons.scale_outlined),
                selectedIcon: Icon(Icons.scale),
                label: 'Central',
              ),
              NavigationDestination(
                icon: Icon(Icons.widgets_outlined),
                selectedIcon: Icon(Icons.widgets),
                label: 'Produtos',
              ),
              NavigationDestination(
                icon: Icon(Icons.support_agent_outlined),
                selectedIcon: Icon(Icons.support_agent),
                label: 'Contato',
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _select(int index) => setState(() => _index = index);
}

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key, required this.data, required this.onSelect});

  final AppData data;
  final ValueChanged<int> onSelect;

  @override
  Widget build(BuildContext context) {
    final featured = data.products.firstWhere(
      (item) => item.name.toLowerCase().contains('lc teste'),
      orElse: () =>
          data.products.isNotEmpty ? data.products.first : Product.empty(),
    );
    return AppScroll(
      title: 'Exatta Tech',
      subtitle: 'Apps, produtos e suporte técnico para pesagem.',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Eyebrow('Tecnologia sob medida'),
          const SizedBox(height: 14),
          const Text(
            'Soluções de pesagem no bolso.',
            style: TextStyle(
              fontSize: 36,
              height: 1.02,
              fontWeight: FontWeight.w900,
              letterSpacing: 0,
            ),
          ),
          const SizedBox(height: 12),
          const Text(
            'Acesse manuais, vídeos técnicos, produtos, aplicativos e suporte direto em uma experiência feita para atendimento em campo.',
            style: TextStyle(color: _muted, fontSize: 16, height: 1.45),
          ),
          const SizedBox(height: 22),
          FeaturedProduct(product: featured, onTap: () => onSelect(2)),
          const SizedBox(height: 18),
          GridView.count(
            crossAxisCount: 2,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisSpacing: 12,
            mainAxisSpacing: 12,
            childAspectRatio: 1.18,
            children: [
              StatTile(
                icon: Icons.description_outlined,
                value: '${data.manuals.length}+',
                label: 'Manuais',
              ),
              StatTile(
                icon: Icons.play_circle_outline,
                value: '${data.videos.length}+',
                label: 'Vídeos',
              ),
              StatTile(
                icon: Icons.factory_outlined,
                value: '${data.activeBrands.length}+',
                label: 'Fabricantes',
              ),
              const StatTile(
                icon: Icons.chat_bubble_outline,
                value: 'Suporte',
                label: 'WhatsApp',
              ),
            ],
          ),
          const SizedBox(height: 18),
          QuickAction(
            title: 'Central dos Balanceiros',
            text: 'Buscar manual, vídeo ou fabricante.',
            icon: Icons.scale,
            onTap: () => onSelect(1),
          ),
          QuickAction(
            title: 'Produtos',
            text: 'Licenças, equipamentos e serviços.',
            icon: Icons.widgets,
            onTap: () => onSelect(2),
          ),
        ],
      ),
    );
  }
}

class CentralScreen extends StatefulWidget {
  const CentralScreen({super.key, required this.data});

  final AppData data;

  @override
  State<CentralScreen> createState() => _CentralScreenState();
}

class _CentralScreenState extends State<CentralScreen> {
  String _query = '';
  String _brand = 'Todos';
  CentralTab _tab = CentralTab.manuals;

  @override
  Widget build(BuildContext context) {
    final brands = ['Todos', ...widget.data.activeBrands];
    final manuals = widget.data.manuals.where(_matches).toList();
    final videos = widget.data.videos.where(_matches).toList();
    final items = _tab == CentralTab.manuals ? manuals : videos;
    return AppScroll(
      title: 'Central',
      subtitle:
          '${widget.data.manuals.length} manuais e ${widget.data.videos.length} vídeos técnicos',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Eyebrow('Central dos Balanceiros'),
          const SizedBox(height: 14),
          const Text(
            'Busque por marca, modelo ou tipo de equipamento.',
            style: TextStyle(
              fontSize: 30,
              height: 1.06,
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(height: 16),
          TextField(
            onChanged: (value) => setState(() => _query = value),
            style: const TextStyle(color: _text),
            decoration: InputDecoration(
              hintText: 'Ex: Toledo, WT1000, IQ66...',
              hintStyle: const TextStyle(color: _muted),
              prefixIcon: const Icon(Icons.search, color: _muted),
              filled: true,
              fillColor: _surface,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(18),
                borderSide: const BorderSide(color: _line),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(18),
                borderSide: const BorderSide(color: _line),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(18),
                borderSide: const BorderSide(color: _cyan),
              ),
            ),
          ),
          const SizedBox(height: 14),
          SizedBox(
            height: 40,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: brands.length,
              separatorBuilder: (_, _) => const SizedBox(width: 8),
              itemBuilder: (context, index) {
                final brand = brands[index];
                return ChoiceChip(
                  label: Text(brand),
                  selected: brand == _brand,
                  onSelected: (_) => setState(() => _brand = brand),
                  selectedColor: _cyan,
                  labelStyle: TextStyle(
                    color: brand == _brand ? _bg : _text,
                    fontWeight: FontWeight.w700,
                  ),
                  backgroundColor: _surface,
                  side: const BorderSide(color: _line),
                );
              },
            ),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              TabPill(
                label: 'Manuais',
                count: manuals.length,
                selected: _tab == CentralTab.manuals,
                onTap: () => setState(() => _tab = CentralTab.manuals),
              ),
              const SizedBox(width: 10),
              TabPill(
                label: 'Vídeos',
                count: videos.length,
                selected: _tab == CentralTab.videos,
                onTap: () => setState(() => _tab = CentralTab.videos),
              ),
            ],
          ),
          const SizedBox(height: 16),
          if (items.isEmpty)
            const EmptyCard(
              title: 'Nada encontrado',
              text: 'Tente buscar por outra marca ou modelo.',
            )
          else
            ...items.take(80).map((item) {
              if (item is ManualItem) return ManualCard(item: item);
              return VideoCard(item: item as VideoItem);
            }),
          if (items.length > 80)
            Padding(
              padding: const EdgeInsets.only(top: 10),
              child: Text(
                '${items.length - 80} resultados adicionais. Refine a busca para ver menos itens.',
                style: const TextStyle(color: _muted),
              ),
            ),
        ],
      ),
    );
  }

  bool _matches(Searchable item) {
    final query = normalize(_query);
    final brandOk = _brand == 'Todos' || item.brand == _brand;
    final queryOk = query.isEmpty || normalize(item.searchText).contains(query);
    return brandOk && queryOk;
  }
}

class ProductsScreen extends StatelessWidget {
  const ProductsScreen({super.key, required this.data});

  final AppData data;

  @override
  Widget build(BuildContext context) {
    return AppScroll(
      title: 'Produtos',
      subtitle: 'Licenças, equipamentos e serviços Exatta Tech',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Eyebrow('Produtos'),
          const SizedBox(height: 14),
          const Text(
            'Peça exatamente o que sua operação precisa.',
            style: TextStyle(
              fontSize: 30,
              height: 1.06,
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(height: 12),
          const Text(
            'Produtos, aplicativos, licenças e serviços com atendimento direto pelo WhatsApp.',
            style: TextStyle(color: _muted, fontSize: 16, height: 1.45),
          ),
          const SizedBox(height: 18),
          ...data.products.map((product) => ProductCard(product: product)),
        ],
      ),
    );
  }
}

class ContactScreen extends StatelessWidget {
  const ContactScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return AppScroll(
      title: 'Contato',
      subtitle: 'Fale com a Exatta Tech',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Eyebrow('Atendimento'),
          const SizedBox(height: 14),
          const Text(
            'Vamos resolver sua demanda.',
            style: TextStyle(
              fontSize: 32,
              height: 1.06,
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(height: 12),
          const Text(
            'Solicite orçamento, tire dúvidas sobre aplicativos ou envie uma demanda técnica da Central dos Balanceiros.',
            style: TextStyle(color: _muted, fontSize: 16, height: 1.45),
          ),
          const SizedBox(height: 20),
          ContactButton(
            icon: Icons.chat_bubble_outline,
            title: 'WhatsApp',
            text: '+55 (37) 99846-6711',
            onTap: () => openUrl(
              'https://wa.me/5537998466711?text=Ol%C3%A1%2C%20vim%20pelo%20app%20Exatta%20Tech.',
            ),
          ),
          ContactButton(
            icon: Icons.mail_outline,
            title: 'E-mail',
            text: 'alexjunior201159@gmail.com',
            onTap: () => openUrl('mailto:alexjunior201159@gmail.com'),
          ),
          ContactButton(
            icon: Icons.public,
            title: 'Site',
            text: 'exattatech.com',
            onTap: () => openUrl('https://exattatech.com'),
          ),
          const SizedBox(height: 12),
          const InfoPanel(),
        ],
      ),
    );
  }
}

class AppData {
  AppData({
    required this.manuals,
    required this.videos,
    required this.products,
  });

  final List<ManualItem> manuals;
  final List<VideoItem> videos;
  final List<Product> products;

  List<String> get activeBrands {
    final brands = <String>{};
    for (final item in manuals) {
      brands.add(item.brand);
    }
    for (final item in videos) {
      brands.add(item.brand);
    }
    final list = brands.toList()..sort((a, b) => a.compareTo(b));
    return list;
  }

  static Future<AppData> load() async {
    final base =
        jsonDecode(await rootBundle.loadString('assets/data/base.json'))
            as Map<String, dynamic>;
    final overrides =
        jsonDecode(await rootBundle.loadString('assets/data/overrides.json'))
            as Map<String, dynamic>;
    final removed =
        (overrides['removed'] as Map?)?.cast<String, dynamic>() ?? {};

    final manuals = mergeSection(
      base['manuals'],
      overrides['manuals'],
      removed['manuals'],
    ).map((item) => ManualItem.fromMap(item)).toList();
    final videos = mergeSection(
      base['videos'],
      overrides['videos'],
      removed['videos'],
    ).map((item) => VideoItem.fromMap(item)).toList();
    final products =
        mergeSection(
              base['products'],
              overrides['products'],
              removed['products'],
            )
            .map((item) => Product.fromMap(item))
            .where((item) => item.name.isNotEmpty)
            .toList();

    manuals.sort(
      (a, b) => '${a.brand} ${a.model}'.compareTo('${b.brand} ${b.model}'),
    );
    videos.sort(
      (a, b) => '${a.brand} ${a.model}'.compareTo('${b.brand} ${b.model}'),
    );
    return AppData(manuals: manuals, videos: videos, products: products);
  }
}

List<Map<String, dynamic>> mergeSection(
  dynamic baseRaw,
  dynamic overrideRaw,
  dynamic removedRaw,
) {
  final removed = (removedRaw as List? ?? const [])
      .map((item) => item.toString())
      .toSet();
  final map = <String, Map<String, dynamic>>{};
  for (final item in (baseRaw as List? ?? const [])) {
    final value = Map<String, dynamic>.from(item as Map);
    final id = value['id']?.toString();
    if (id != null && !removed.contains(id)) map[id] = value;
  }
  for (final item in (overrideRaw as List? ?? const [])) {
    final value = Map<String, dynamic>.from(item as Map);
    final id =
        value['id']?.toString() ??
        '${value['brand']}-${value['model']}-${map.length}';
    map[id] = value..['id'] = id;
  }
  return map.values.toList();
}

abstract class Searchable {
  String get brand;
  String get model;
  String get searchText;
}

class ManualItem implements Searchable {
  ManualItem({
    required this.brand,
    required this.model,
    required this.type,
    required this.desc,
    required this.url,
    required this.sourceUrl,
  });

  @override
  final String brand;
  @override
  final String model;
  final String type;
  final String desc;
  final String url;
  final String sourceUrl;

  factory ManualItem.fromMap(Map<String, dynamic> map) {
    return ManualItem(
      brand: textOf(map['brand']),
      model: textOf(map['model']),
      type: textOf(map['type']),
      desc: stripMarkdown(textOf(map['desc'])),
      url: textOf(map['url']),
      sourceUrl: textOf(map['sourceUrl']),
    );
  }

  @override
  String get searchText => '$brand $model $type $desc';
}

class VideoItem implements Searchable {
  VideoItem({
    required this.brand,
    required this.model,
    required this.desc,
    required this.url,
  });

  @override
  final String brand;
  @override
  final String model;
  final String desc;
  final String url;

  factory VideoItem.fromMap(Map<String, dynamic> map) {
    return VideoItem(
      brand: textOf(map['brand']),
      model: textOf(map['model']),
      desc: stripMarkdown(textOf(map['desc'])),
      url: textOf(map['url']),
    );
  }

  @override
  String get searchText => '$brand $model $desc';
}

class Product {
  Product({
    required this.name,
    required this.category,
    required this.priceLabel,
    required this.desc,
    required this.image,
  });

  final String name;
  final String category;
  final String priceLabel;
  final String desc;
  final String image;

  factory Product.fromMap(Map<String, dynamic> map) {
    return Product(
      name: textOf(map['name']),
      category: textOf(map['category']),
      priceLabel: textOf(map['priceLabel']).isEmpty
          ? 'Consultar preço'
          : textOf(map['priceLabel']),
      desc: stripMarkdown(textOf(map['desc'])),
      image: textOf(map['image']),
    );
  }

  factory Product.empty() =>
      Product(name: '', category: '', priceLabel: '', desc: '', image: '');
}

class AppScroll extends StatelessWidget {
  const AppScroll({
    super.key,
    required this.title,
    required this.subtitle,
    required this.child,
  });

  final String title;
  final String subtitle;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFF071018), Color(0xFF0B1320), Color(0xFF071018)],
        ),
      ),
      child: SafeArea(
        bottom: false,
        child: CustomScrollView(
          slivers: [
            SliverAppBar(
              floating: true,
              snap: true,
              backgroundColor: _bg.withValues(alpha: .92),
              surfaceTintColor: Colors.transparent,
              titleSpacing: 18,
              title: Row(
                children: [
                  const LogoMark(),
                  const SizedBox(width: 10),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        title,
                        style: const TextStyle(
                          fontSize: 17,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                      Text(
                        subtitle,
                        style: const TextStyle(
                          fontSize: 11,
                          color: _muted,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            SliverPadding(
              padding: const EdgeInsets.fromLTRB(18, 18, 18, 110),
              sliver: SliverToBoxAdapter(child: child),
            ),
          ],
        ),
      ),
    );
  }
}

class LogoMark extends StatelessWidget {
  const LogoMark({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 38,
      height: 38,
      decoration: BoxDecoration(
        gradient: const LinearGradient(colors: [_blue, _cyan]),
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(color: _cyan.withValues(alpha: .2), blurRadius: 18),
        ],
      ),
      child: const Icon(Icons.scale, color: _bg, size: 22),
    );
  }
}

class Eyebrow extends StatelessWidget {
  const Eyebrow(this.text, {super.key});

  final String text;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
      decoration: BoxDecoration(
        color: _cyan.withValues(alpha: .1),
        border: Border.all(color: _cyan.withValues(alpha: .28)),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        text.toUpperCase(),
        style: const TextStyle(
          color: _cyan,
          fontSize: 11,
          fontWeight: FontWeight.w900,
          letterSpacing: 1.1,
        ),
      ),
    );
  }
}

class FeaturedProduct extends StatelessWidget {
  const FeaturedProduct({
    super.key,
    required this.product,
    required this.onTap,
  });

  final Product product;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      borderRadius: BorderRadius.circular(26),
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: _surface2,
          borderRadius: BorderRadius.circular(26),
          border: Border.all(color: _cyan.withValues(alpha: .22)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(20),
              child: AssetImageBox(path: product.image, height: 170),
            ),
            const SizedBox(height: 14),
            Text(
              product.name,
              style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w900),
            ),
            const SizedBox(height: 6),
            Text(
              truncate(product.desc, 120),
              style: const TextStyle(color: _muted, height: 1.4),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Text(
                  product.priceLabel,
                  style: const TextStyle(
                    color: _cyan,
                    fontSize: 16,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                const Spacer(),
                const Icon(Icons.arrow_forward, color: _cyan),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class StatTile extends StatelessWidget {
  const StatTile({
    super.key,
    required this.icon,
    required this.value,
    required this.label,
  });

  final IconData icon;
  final String value;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: _surface,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: _line),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Icon(icon, color: _cyan),
          Text(
            value,
            style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w900),
          ),
          Text(
            label,
            style: const TextStyle(
              color: _muted,
              fontSize: 12,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );
  }
}

class QuickAction extends StatelessWidget {
  const QuickAction({
    super.key,
    required this.title,
    required this.text,
    required this.icon,
    required this.onTap,
  });

  final String title;
  final String text;
  final IconData icon;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: InkWell(
        borderRadius: BorderRadius.circular(20),
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: _surface,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: _line),
          ),
          child: Row(
            children: [
              CircleAvatar(
                backgroundColor: _cyan.withValues(alpha: .12),
                foregroundColor: _cyan,
                child: Icon(icon),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: const TextStyle(fontWeight: FontWeight.w900),
                    ),
                    Text(
                      text,
                      style: const TextStyle(color: _muted, fontSize: 13),
                    ),
                  ],
                ),
              ),
              const Icon(Icons.chevron_right, color: _muted),
            ],
          ),
        ),
      ),
    );
  }
}

class TabPill extends StatelessWidget {
  const TabPill({
    super.key,
    required this.label,
    required this.count,
    required this.selected,
    required this.onTap,
  });

  final String label;
  final int count;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: FilledButton(
        onPressed: onTap,
        style: FilledButton.styleFrom(
          backgroundColor: selected ? _cyan : _surface,
          foregroundColor: selected ? _bg : _text,
          padding: const EdgeInsets.symmetric(vertical: 14),
        ),
        child: Text(
          '$label  $count',
          style: const TextStyle(fontWeight: FontWeight.w900),
        ),
      ),
    );
  }
}

class ManualCard extends StatelessWidget {
  const ManualCard({super.key, required this.item});

  final ManualItem item;

  @override
  Widget build(BuildContext context) {
    return ResultCard(
      icon: Icons.picture_as_pdf_outlined,
      title: '${item.brand} — ${item.model}',
      subtitle: item.type.isEmpty ? 'Manual técnico' : item.type,
      text: item.desc,
      button: 'Abrir manual',
      onTap: item.url.isEmpty ? null : () => openUrl(item.url),
    );
  }
}

class VideoCard extends StatelessWidget {
  const VideoCard({super.key, required this.item});

  final VideoItem item;

  @override
  Widget build(BuildContext context) {
    return ResultCard(
      icon: Icons.play_circle_outline,
      title: '${item.brand} — ${item.model}',
      subtitle: 'Vídeo técnico',
      text: item.desc,
      button: 'Assistir',
      onTap: item.url.isEmpty ? null : () => openUrl(item.url),
    );
  }
}

class ResultCard extends StatelessWidget {
  const ResultCard({
    super.key,
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.text,
    required this.button,
    this.onTap,
  });

  final IconData icon;
  final String title;
  final String subtitle;
  final String text;
  final String button;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: _surface,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: _line),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              CircleAvatar(
                backgroundColor: _cyan.withValues(alpha: .12),
                foregroundColor: _cyan,
                child: Icon(icon),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: const TextStyle(
                        fontWeight: FontWeight.w900,
                        height: 1.2,
                      ),
                    ),
                    const SizedBox(height: 3),
                    Text(
                      subtitle,
                      style: const TextStyle(color: _muted, fontSize: 12),
                    ),
                  ],
                ),
              ),
            ],
          ),
          if (text.isNotEmpty) ...[
            const SizedBox(height: 10),
            Text(
              truncate(text, 170),
              style: const TextStyle(color: _muted, height: 1.4),
            ),
          ],
          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
            child: OutlinedButton.icon(
              onPressed: onTap,
              icon: Icon(
                icon == Icons.play_circle_outline
                    ? Icons.play_arrow
                    : Icons.open_in_new,
              ),
              label: Text(button),
            ),
          ),
        ],
      ),
    );
  }
}

class ProductCard extends StatelessWidget {
  const ProductCard({super.key, required this.product});

  final Product product;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      decoration: BoxDecoration(
        color: const Color(0xFFF3F6FB),
        borderRadius: BorderRadius.circular(24),
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          AssetImageBox(path: product.image, height: 190, light: true),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  product.category.toUpperCase(),
                  style: const TextStyle(
                    color: _blue,
                    fontSize: 11,
                    fontWeight: FontWeight.w900,
                    letterSpacing: 1,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  product.name,
                  style: const TextStyle(
                    color: Color(0xFF111827),
                    fontSize: 21,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  truncate(product.desc, 160),
                  style: const TextStyle(color: Color(0xFF607089), height: 1.4),
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Text(
                      product.priceLabel,
                      style: const TextStyle(
                        color: _blue,
                        fontSize: 18,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                    const Spacer(),
                    FilledButton(
                      onPressed: () => openUrl(
                        'https://wa.me/5537998466711?text=Tenho%20interesse%20em%20${Uri.encodeComponent(product.name)}',
                      ),
                      child: const Text('Pedir'),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class AssetImageBox extends StatelessWidget {
  const AssetImageBox({
    super.key,
    required this.path,
    required this.height,
    this.light = false,
  });

  final String path;
  final double height;
  final bool light;

  @override
  Widget build(BuildContext context) {
    final asset = assetPath(path);
    if (asset == null) return PlaceholderBox(height: height, light: light);
    return Image.asset(
      asset,
      width: double.infinity,
      height: height,
      fit: BoxFit.cover,
      errorBuilder: (_, _, _) => PlaceholderBox(height: height, light: light),
    );
  }
}

class PlaceholderBox extends StatelessWidget {
  const PlaceholderBox({super.key, required this.height, this.light = false});

  final double height;
  final bool light;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      height: height,
      color: light ? const Color(0xFFE6ECF5) : _surface,
      child: Icon(
        Icons.widgets_outlined,
        size: 44,
        color: light ? _blue : _cyan,
      ),
    );
  }
}

class ContactButton extends StatelessWidget {
  const ContactButton({
    super.key,
    required this.icon,
    required this.title,
    required this.text,
    required this.onTap,
  });

  final IconData icon;
  final String title;
  final String text;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        borderRadius: BorderRadius.circular(20),
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: _surface,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: _line),
          ),
          child: Row(
            children: [
              CircleAvatar(
                backgroundColor: _green.withValues(alpha: .14),
                foregroundColor: _green,
                child: Icon(icon),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: const TextStyle(fontWeight: FontWeight.w900),
                    ),
                    Text(text, style: const TextStyle(color: _muted)),
                  ],
                ),
              ),
              const Icon(Icons.open_in_new, color: _muted),
            ],
          ),
        ),
      ),
    );
  }
}

class InfoPanel extends StatelessWidget {
  const InfoPanel({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: _cyan.withValues(alpha: .08),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: _cyan.withValues(alpha: .22)),
      ),
      child: const Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Exatta Tech',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900),
          ),
          SizedBox(height: 8),
          Text('CNPJ: 57.593.441/0001-61', style: TextStyle(color: _muted)),
          Text(
            'Atendimento remoto em todo o Brasil',
            style: TextStyle(color: _muted),
          ),
        ],
      ),
    );
  }
}

class EmptyCard extends StatelessWidget {
  const EmptyCard({super.key, required this.title, required this.text});

  final String title;
  final String text;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: _surface,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: _line),
      ),
      child: Column(
        children: [
          const Icon(Icons.search_off, color: _muted, size: 34),
          const SizedBox(height: 10),
          Text(title, style: const TextStyle(fontWeight: FontWeight.w900)),
          const SizedBox(height: 4),
          Text(
            text,
            style: const TextStyle(color: _muted),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}

class ErrorScreen extends StatelessWidget {
  const ErrorScreen({super.key, required this.error});

  final String error;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Text(
            'Não foi possível carregar os dados do app.\n\n$error',
            textAlign: TextAlign.center,
          ),
        ),
      ),
    );
  }
}

enum CentralTab { manuals, videos }

String textOf(dynamic value) => value?.toString().trim() ?? '';

String normalize(String value) {
  const from = 'áàâãäéèêëíìîïóòôõöúùûüçñÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇÑ';
  const to = 'aaaaaeeeeiiiiooooouuuucnAAAAAEEEEIIIIOOOOOUUUUCN';
  var output = value.toLowerCase();
  for (var i = 0; i < from.length; i++) {
    output = output.replaceAll(from[i], to[i].toLowerCase());
  }
  return output;
}

String stripMarkdown(String value) {
  return value
      .replaceAll(RegExp(r'#{1,6}\s*'), '')
      .replaceAll(RegExp(r'\*\*'), '')
      .replaceAll(RegExp(r'[*_`>-]'), ' ')
      .replaceAll(RegExp(r'\s+'), ' ')
      .trim();
}

String truncate(String value, int max) {
  if (value.length <= max) return value;
  return '${value.substring(0, max).trim()}...';
}

String? assetPath(String sitePath) {
  if (sitePath.isEmpty) return null;
  final clean = sitePath.split('?').first;
  final file = clean.split('/').last;
  if (file.isEmpty) return null;
  return 'assets/images/$file';
}

Future<void> openUrl(String url) async {
  final uri = Uri.parse(url);
  await launchUrl(uri, mode: LaunchMode.externalApplication);
}
