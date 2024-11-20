import { describe, it } from "node:test";
import { inject, Injectable, overwriteInjectionTarget } from "framework";
import { assertEquals, assertNotEquals } from "@std/assert";

// Helper
const getGreeting = (name: string) => `Hello, ${name}`;
const getGreetingMock = (name: string) => `Hello, ${name} from Mocked greeter`;
const getGreetingCustom = (name: string) =>
  `Hello, ${name} from custom greeter`;
const getGreetingCustomMock = (name: string) =>
  `Hello, ${name} from custom Mocked greeter`;

// Testdata
const NAME = "Paul";
const CUSTOM_TOKEN = "custom_token";
const EXPECTED = {
  greeting: getGreeting(NAME),
  mockedGreeting: getGreetingMock(NAME),
  customGreeting: getGreetingCustom(NAME),
  mockedCustomGreeting: getGreetingCustomMock(NAME),
};

// implementations
interface IGreeter {
  getGreeting(name: string): string;
}

@Injectable()
class TestService implements IGreeter {
  getGreeting(name: string) {
    return getGreeting(name);
  }
}

@Injectable(CUSTOM_TOKEN)
class TestCustomService implements IGreeter {
  getGreeting(name: string) {
    return getGreetingCustom(name);
  }
}

class TestInjectionTarget {
  private readonly testService = inject(TestService);
  get greeter() {
    return this.testService;
  }
  private readonly customService = inject<TestCustomService>(CUSTOM_TOKEN);
  get customGreeter() {
    return this.customService;
  }
}

Deno.test("[Injectable]: can inject class", () => {
  const instance = new TestInjectionTarget();
  assertNotEquals(instance.greeter, null, "missing injection instance");
  assertEquals(
    instance.greeter?.getGreeting(NAME),
    EXPECTED.greeting,
    "wrong service injected"
  );
});

Deno.test("[Injectable]: can use custom token", () => {
  const instance = new TestInjectionTarget();
  assertNotEquals(instance.customGreeter, null, "missing injection instance");
  assertEquals(
    instance.customGreeter?.getGreeting(NAME),
    EXPECTED.customGreeting,
    "wrong service injected"
  );
});

Deno.test("[Injectable]: can mock injection", () => {
  overwriteInjectionTarget(TestService, {
    getGreeting: () => getGreetingMock(NAME),
  });
  const instance = new TestInjectionTarget();
  assertNotEquals(instance.greeter, null, "missing injection instance");
  assertEquals(
    instance.greeter?.getGreeting(NAME),
    EXPECTED.mockedGreeting,
    "wrong service injected"
  );
});

Deno.test("[Injectable]: can mock injection with custom token", () => {
  overwriteInjectionTarget(CUSTOM_TOKEN, {
    getGreeting: () => getGreetingCustomMock(NAME),
  });
  const instance = new TestInjectionTarget();
  assertNotEquals(instance.customGreeter, null, "missing injection instance");
  assertEquals(
    instance.customGreeter?.getGreeting(NAME),
    EXPECTED.mockedCustomGreeting,
    "wrong service injected"
  );
});
