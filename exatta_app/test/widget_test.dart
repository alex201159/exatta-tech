import 'package:exatta_app/main.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('carrega a tela inicial da Exatta Tech', (tester) async {
    await tester.pumpWidget(const ExattaApp());
    await tester.runAsync(() async {
      await Future<void>.delayed(const Duration(milliseconds: 500));
    });
    await tester.pump();

    expect(find.byType(NavigationBar), findsOneWidget);
    expect(find.byIcon(Icons.scale_outlined), findsOneWidget);
    expect(find.text('Central'), findsWidgets);
    expect(find.text('Produtos'), findsWidgets);
  });
}
