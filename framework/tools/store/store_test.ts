import { assertEquals } from "@std/assert";
import { Store } from "./store.ts";
import { Entity, Column } from "typeorm";
import { BaseEntity } from "./base.ts";

@Entity()
class TestTemplateEntity extends BaseEntity {
  @Column("text")
  name = "";
  @Column("text")
  template = "";
}

@Entity()
class TestNoUsage extends BaseEntity {
  @Column("text")
  fake = "";
}

Deno.test(async function getAndUseTypeormRepoFromStore() {
  const store = new Store("templates_test", [TestTemplateEntity], true);
  const [repo, err] = await store.getRepo(TestTemplateEntity);
  if (err || !repo) {
    assertEquals(
      1,
      2,
      `failed to initialize repo ${TestTemplateEntity.name} Error: ${err?.message}`
    );
    return;
  }
  const template1 = new TestTemplateEntity();
  const template1Id = template1.id;
  template1.name = "T1";
  template1.template = "<h1>Hallo</h1>";

  await repo.save(template1);
  const findResult = await repo.findBy({
    name: template1.name,
  });
  assertEquals(findResult.length, 1);
  assertEquals(findResult.find(() => true)?.id, template1Id);
  assertEquals(findResult.find(() => true)?.name, template1.name);
  assertEquals(findResult.find(() => true)?.template, template1.template);
});

Deno.test(async function throwErrorOnUseNotRegisteredEntity() {
  const store = new Store("templates_test", [TestTemplateEntity], true);
  const [repo, err] = await store.getRepo(TestNoUsage);
  if (repo || !err) {
    assertEquals(
      1,
      2,
      `registered repo ${TestNoUsage.name} was found an initialized`
    );
    return;
  }
});
