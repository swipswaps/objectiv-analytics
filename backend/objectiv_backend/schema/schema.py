from typing import List, Dict, Any
from abc import ABC


class AbstractContext(ABC):
    """
    Abstract Contexts define either properties required by Collectors or internal ones for hierarchical
    discrimination purposes.

    All Contexts inherit from AbstractContext. It defines the bare minimum properties every Context must implement.

    For example we never want to mix Location Contexts with Global Contexts and Events may requires specific Contexts
    to be present in their Location Stack. Eg. a NavigationContext instead of a generic SectionContext.

    This ensures that Events are carrying the Contexts they require, making them meaningful and identifiable.

    All Contexts inherit from AbstractContext. It defines the bare minimum properties every Context must implement.

    Attributes:
        id (str):
            A unique string identifier to be combined with the Context Type (`_context_type`) 
           for Context instance uniqueness.
    """

    def __init__(self, id: str, **kwargs):
        """
        :param id: 
           A unique string identifier to be combined with the Context Type (`_context_type`) 
           for Context instance uniqueness.
        """

        self.id = id


class AbstractLocationContext(AbstractContext):
    """
    This is the abstract parent of all location contexts. LocationContexts are used to populate Trackers or Events
    `location_stack` properties. A Location Stack is meant to describe accurately where an Event originated in the
    UI Eg. Sections, Menus, etc.

    Attributes:
        id (str):
            A unique string identifier to be combined with the Context Type (`_context_type`) 
           for Context instance uniqueness.
    """

    def __init__(self, id: str, **kwargs):
        """
        :param id: 
           A unique string identifier to be combined with the Context Type (`_context_type`) 
           for Context instance uniqueness.
        """

        AbstractContext.__init__(self, id=id)


class AbstractGlobalContext(AbstractContext):
    """
    Global_contexts are used to populate Trackers or Events `global_contexts` properties. They carry information
    that is not related to where the Event originated, such as device, platform or business data.

    Attributes:
        id (str):
            A unique string identifier to be combined with the Context Type (`_context_type`) 
           for Context instance uniqueness.
    """

    def __init__(self, id: str, **kwargs):
        """
        :param id: 
           A unique string identifier to be combined with the Context Type (`_context_type`) 
           for Context instance uniqueness.
        """

        AbstractContext.__init__(self, id=id)


class ApplicationContext(AbstractGlobalContext):
    """
    Global context containing the origin (application id) of the event

    Attributes:
        id (str):
            A unique string identifier to be combined with the Context Type (`_context_type`) 
           for Context instance uniqueness.
    """

    def __init__(self, id: str, **kwargs):
        """
        :param id: 
           A unique string identifier to be combined with the Context Type (`_context_type`) 
           for Context instance uniqueness.
        """

        AbstractGlobalContext.__init__(self, id=id)


class SectionContext(AbstractLocationContext):
    """
    SectionContexts are special LocationContexts representing a logical area of the UI or the system.
    They can be often reasoned about as being containers of other LocationContexts but not the direct targets of
    Events.

    Attributes:
        id (str):
            A unique string identifier to be combined with the Context Type (`_context_type`) 
           for Context instance uniqueness.
    """

    def __init__(self, id: str, **kwargs):
        """
        :param id: 
           A unique string identifier to be combined with the Context Type (`_context_type`) 
           for Context instance uniqueness.
        """

        AbstractLocationContext.__init__(self, id=id)


class WebDocumentContext(SectionContext):
    """
    global context about a web document. Should at least contain the current URL.

    Attributes:
        url (str):
            Property containing a (valid) URL
        id (str):
            A unique string identifier to be combined with the Context Type (`_context_type`) 
           for Context instance uniqueness.
    """

    def __init__(self, url: str, id: str, **kwargs):
        """
        :param url: 
           Property containing a (valid) URL
        :param id: 
           A unique string identifier to be combined with the Context Type (`_context_type`) 
           for Context instance uniqueness.
        """

        SectionContext.__init__(self, id=id)
        self.url = url


class ScreenContext(SectionContext):
    """
    SectionContext for a screen

    Attributes:
        screen (str):
            name of the screen
        id (str):
            A unique string identifier to be combined with the Context Type (`_context_type`) 
           for Context instance uniqueness.
    """

    def __init__(self, screen: str, id: str, **kwargs):
        """
        :param screen: 
           name of the screen
        :param id: 
           A unique string identifier to be combined with the Context Type (`_context_type`) 
           for Context instance uniqueness.
        """

        SectionContext.__init__(self, id=id)
        self.screen = screen


class ExpandableSectionContext(SectionContext):
    """
    A `SectionContext` that is expandable.

    Attributes:
        id (str):
            A unique string identifier to be combined with the Context Type (`_context_type`) 
           for Context instance uniqueness.
    """

    def __init__(self, id: str, **kwargs):
        """
        :param id: 
           A unique string identifier to be combined with the Context Type (`_context_type`) 
           for Context instance uniqueness.
        """

        SectionContext.__init__(self, id=id)


class MediaPlayerContext(SectionContext):
    """
    A `SectionContext` containing a media player.

    Attributes:
        id (str):
            A unique string identifier to be combined with the Context Type (`_context_type`) 
           for Context instance uniqueness.
    """

    def __init__(self, id: str, **kwargs):
        """
        :param id: 
           A unique string identifier to be combined with the Context Type (`_context_type`) 
           for Context instance uniqueness.
        """

        SectionContext.__init__(self, id=id)


class NavigationContext(SectionContext):
    """
    A `SectionContext` containing navigational elements, for example a menu.

    Attributes:
        id (str):
            A unique string identifier to be combined with the Context Type (`_context_type`) 
           for Context instance uniqueness.
    """

    def __init__(self, id: str, **kwargs):
        """
        :param id: 
           A unique string identifier to be combined with the Context Type (`_context_type`) 
           for Context instance uniqueness.
        """

        SectionContext.__init__(self, id=id)


class OverlayContext(SectionContext):
    """
    A `SectionContext` that is an overlay

    Attributes:
        id (str):
            A unique string identifier to be combined with the Context Type (`_context_type`) 
           for Context instance uniqueness.
    """

    def __init__(self, id: str, **kwargs):
        """
        :param id: 
           A unique string identifier to be combined with the Context Type (`_context_type`) 
           for Context instance uniqueness.
        """

        SectionContext.__init__(self, id=id)


class ItemContext(AbstractLocationContext):
    """
    ItemContexts are special LocationContexts representing interactive elements of the UI or targets in a system.
    These elements may trigger both Interactive and Non-Interactive Events. Eg. an Input field or a Button.

    Attributes:
        id (str):
            A unique string identifier to be combined with the Context Type (`_context_type`) 
           for Context instance uniqueness.
    """

    def __init__(self, id: str, **kwargs):
        """
        :param id: 
           A unique string identifier to be combined with the Context Type (`_context_type`) 
           for Context instance uniqueness.
        """

        AbstractLocationContext.__init__(self, id=id)


class InputContext(ItemContext):
    """
    A location context, representing user input. For example, a form field, like input.

    Attributes:
        id (str):
            A unique string identifier to be combined with the Context Type (`_context_type`) 
           for Context instance uniqueness.
    """

    def __init__(self, id: str, **kwargs):
        """
        :param id: 
           A unique string identifier to be combined with the Context Type (`_context_type`) 
           for Context instance uniqueness.
        """

        ItemContext.__init__(self, id=id)


class ActionContext(ItemContext):
    """
    ActionContexts are a more specific version of ItemContext specifically meant to describe actionable Items.
    These represent interactive elements that will trigger an Interactive Event. Eg. A Button or Link.

    Attributes:
        text (str):
            The text of the interactive element or, for visuals, a string describing it
        id (str):
            A unique string identifier to be combined with the Context Type (`_context_type`) 
           for Context instance uniqueness.
    """

    def __init__(self, text: str, id: str, **kwargs):
        """
        :param text: 
           The text of the interactive element or, for visuals, a string describing it
        :param id: 
           A unique string identifier to be combined with the Context Type (`_context_type`) 
           for Context instance uniqueness.
        """

        ItemContext.__init__(self, id=id)
        self.text = text


class ButtonContext(ActionContext):
    """
    interactive element, representing a button.

    Attributes:
        text (str):
            The text of the interactive element or, for visuals, a string describing it
        id (str):
            A unique string identifier to be combined with the Context Type (`_context_type`) 
           for Context instance uniqueness.
    """

    def __init__(self, text: str, id: str, **kwargs):
        """
        :param text: 
           The text of the interactive element or, for visuals, a string describing it
        :param id: 
           A unique string identifier to be combined with the Context Type (`_context_type`) 
           for Context instance uniqueness.
        """

        ActionContext.__init__(self, text=text, id=id)


class LinkContext(ActionContext):
    """
    interactive element, representing a (hyper) link.

    Attributes:
        href (str):
            URL (href) the link points to
        text (str):
            The text of the interactive element or, for visuals, a string describing it
        id (str):
            A unique string identifier to be combined with the Context Type (`_context_type`) 
           for Context instance uniqueness.
    """

    def __init__(self,
                 href: str,
                 text: str,
                 id: str,
                 **kwargs):
        """
        :param href: 
           URL (href) the link points to
        :param text: 
           The text of the interactive element or, for visuals, a string describing it
        :param id: 
           A unique string identifier to be combined with the Context Type (`_context_type`) 
           for Context instance uniqueness.
        """

        ActionContext.__init__(self, text=text, id=id)
        self.href = href


class DeviceContext(AbstractGlobalContext):
    """
    Global context containing meta info about the device that emitted the event.

    Attributes:
        user_agent (str):
            String describing the user-agent that emitted the event
        id (str):
            A unique string identifier to be combined with the Context Type (`_context_type`) 
           for Context instance uniqueness.
    """

    def __init__(self, user_agent: str, id: str, **kwargs):
        """
        :param user_agent: 
           String describing the user-agent that emitted the event
        :param id: 
           A unique string identifier to be combined with the Context Type (`_context_type`) 
           for Context instance uniqueness.
        """

        AbstractGlobalContext.__init__(self, id=id)
        self.user_agent = user_agent


class ErrorContext(AbstractGlobalContext):
    """
    Generic global context to encapsulate any errors

    Attributes:
        message (str):
            Error message
        id (str):
            A unique string identifier to be combined with the Context Type (`_context_type`) 
           for Context instance uniqueness.
    """

    def __init__(self, message: str, id: str, **kwargs):
        """
        :param message: 
           Error message
        :param id: 
           A unique string identifier to be combined with the Context Type (`_context_type`) 
           for Context instance uniqueness.
        """

        AbstractGlobalContext.__init__(self, id=id)
        self.message = message


class CookieIdContext(AbstractGlobalContext):
    """
    Global context with information needed to reconstruct a user session.

    Attributes:
        cookie_id (str):
            Unique identifier from the session cookie
        id (str):
            A unique string identifier to be combined with the Context Type (`_context_type`) 
           for Context instance uniqueness.
    """

    def __init__(self, cookie_id: str, id: str, **kwargs):
        """
        :param cookie_id: 
           Unique identifier from the session cookie
        :param id: 
           A unique string identifier to be combined with the Context Type (`_context_type`) 
           for Context instance uniqueness.
        """

        AbstractGlobalContext.__init__(self, id=id)
        self.cookie_id = cookie_id


class SessionContext(AbstractGlobalContext):
    """
    Context with meta info pertaining to the current session.

    Attributes:
        hit_number (int):
            Hit counter relative to the current session, this event originated in.
        id (str):
            A unique string identifier to be combined with the Context Type (`_context_type`) 
           for Context instance uniqueness.
    """

    def __init__(self, hit_number: int, id: str, **kwargs):
        """
        :param hit_number: 
           Hit counter relative to the current session, this event originated in.
        :param id: 
           A unique string identifier to be combined with the Context Type (`_context_type`) 
           for Context instance uniqueness.
        """

        AbstractGlobalContext.__init__(self, id=id)
        self.hit_number = hit_number


class HttpContext(AbstractGlobalContext):
    """
    Global context with meta information about the agent that sent the event.

    Attributes:
        referer (str):
            Full URL to HTTP referrer of the current page.
        user_agent (str):
            User-agent of the agent that sent the event.
        remote_address (str):
            (public) IP address of the agent that sent the event.
        id (str):
            A unique string identifier to be combined with the Context Type (`_context_type`) 
           for Context instance uniqueness.
    """

    def __init__(self,
                 referer: str,
                 user_agent: str,
                 remote_address: str,
                 id: str,
                 **kwargs):
        """
        :param referer: 
           Full URL to HTTP referrer of the current page.
        :param user_agent: 
           User-agent of the agent that sent the event.
        :param remote_address: 
           (public) IP address of the agent that sent the event.
        :param id: 
           A unique string identifier to be combined with the Context Type (`_context_type`) 
           for Context instance uniqueness.
        """

        AbstractGlobalContext.__init__(self, id=id)
        self.referer = referer
        self.user_agent = user_agent
        self.remote_address = remote_address


class AbstractEvent(ABC):
    """
    Events must provide a `name` and optionally can, but most likely will, carry a list of Location and Global
    Contexts. Additionally, every event must have an `ApplicationContext` to be able to distinguish from what
    application the event originated.

    Attributes:
        location_stack (List[AbstractLocationContext]):
            The location stack is an ordered list (stack), that contains a hierarchy of location contexts that 
            deterministically describes where an event took place from global to specific. 
            The whole stack (list) is needed to exactly pinpoint where in the UI the event originated.
        global_contexts (List[AbstractGlobalContext]):
            Global contexts add global / general information about the event. They carry information that is not 
            related to where the Event originated (location), such as device, platform or business data.
        id (str):
            Unique identifier for a specific instance of an event. Typically UUID's are a good way of 
            implementing this. On the collector side, events should be unique, this means duplicate id's result 
            in `not ok` events.
        tracking_time (int):
            Timestamp indicating when the event was generated (added to the transport queue).
        transport_time (int):
            Timestamp indicating when the event was sent (transported) to the collector.
    """

    def __init__(self,
                 location_stack: List[AbstractLocationContext],
                 global_contexts: List[AbstractGlobalContext],
                 id: str,
                 tracking_time: int,
                 transport_time: int,
                 **kwargs):
        """
        :param location_stack: 
           The location stack is an ordered list (stack), that contains a hierarchy of location contexts that 
            deterministically describes where an event took place from global to specific. 
            The whole stack (list) is needed to exactly pinpoint where in the UI the event originated.
        :param global_contexts: 
           Global contexts add global / general information about the event. They carry information that is not 
            related to where the Event originated (location), such as device, platform or business data.
        :param id: 
           Unique identifier for a specific instance of an event. Typically UUID's are a good way of 
            implementing this. On the collector side, events should be unique, this means duplicate id's result 
            in `not ok` events.
        :param tracking_time: 
           Timestamp indicating when the event was generated (added to the transport queue).
        :param transport_time: 
           Timestamp indicating when the event was sent (transported) to the collector.
        """

        self.location_stack = location_stack
        self.global_contexts = global_contexts
        self.id = id
        self.tracking_time = tracking_time
        self.transport_time = transport_time


class NonInteractiveEvent(AbstractEvent):
    """
    Non interactive events, are events that are not (directly) triggered by an interaction. For example:
    Consider the following flow of events:
    1. press play in a video player -> ButtonEvent -> interactive
    2. Videoplayer starting playback -> MediaStartEvent -> non-interactive

    Attributes:
        location_stack (List[AbstractLocationContext]):
            The location stack is an ordered list (stack), that contains a hierarchy of location contexts that 
            deterministically describes where an event took place from global to specific. 
            The whole stack (list) is needed to exactly pinpoint where in the UI the event originated.
        global_contexts (List[AbstractGlobalContext]):
            Global contexts add global / general information about the event. They carry information that is not 
            related to where the Event originated (location), such as device, platform or business data.
        id (str):
            Unique identifier for a specific instance of an event. Typically UUID's are a good way of 
            implementing this. On the collector side, events should be unique, this means duplicate id's result 
            in `not ok` events.
        tracking_time (int):
            Timestamp indicating when the event was generated (added to the transport queue).
        transport_time (int):
            Timestamp indicating when the event was sent (transported) to the collector.
    """

    def __init__(self,
                 location_stack: List[AbstractLocationContext],
                 global_contexts: List[AbstractGlobalContext],
                 id: str,
                 tracking_time: int,
                 transport_time: int,
                 **kwargs):
        """
        :param location_stack: 
           The location stack is an ordered list (stack), that contains a hierarchy of location contexts that 
            deterministically describes where an event took place from global to specific. 
            The whole stack (list) is needed to exactly pinpoint where in the UI the event originated.
        :param global_contexts: 
           Global contexts add global / general information about the event. They carry information that is not 
            related to where the Event originated (location), such as device, platform or business data.
        :param id: 
           Unique identifier for a specific instance of an event. Typically UUID's are a good way of 
            implementing this. On the collector side, events should be unique, this means duplicate id's result 
            in `not ok` events.
        :param tracking_time: 
           Timestamp indicating when the event was generated (added to the transport queue).
        :param transport_time: 
           Timestamp indicating when the event was sent (transported) to the collector.
        """

        AbstractEvent.__init__(self,
                               location_stack=location_stack,
                               global_contexts=global_contexts,
                               id=id,
                               tracking_time=tracking_time,
                               transport_time=transport_time)


class DocumentLoadedEvent(NonInteractiveEvent):
    """
    A non interactive event that is emitted after a document finishes loading. It should provide a
    `WebDocumentContext` which should describe the state (eg. URL) of the event.

    NOTE: with SPA's this probably only happens once, as page (re)loads don't happen after the initial page load

    Attributes:
        location_stack (List[AbstractLocationContext]):
            The location stack is an ordered list (stack), that contains a hierarchy of location contexts that 
            deterministically describes where an event took place from global to specific. 
            The whole stack (list) is needed to exactly pinpoint where in the UI the event originated.
        global_contexts (List[AbstractGlobalContext]):
            Global contexts add global / general information about the event. They carry information that is not 
            related to where the Event originated (location), such as device, platform or business data.
        id (str):
            Unique identifier for a specific instance of an event. Typically UUID's are a good way of 
            implementing this. On the collector side, events should be unique, this means duplicate id's result 
            in `not ok` events.
        tracking_time (int):
            Timestamp indicating when the event was generated (added to the transport queue).
        transport_time (int):
            Timestamp indicating when the event was sent (transported) to the collector.
    """

    def __init__(self,
                 location_stack: List[AbstractLocationContext],
                 global_contexts: List[AbstractGlobalContext],
                 id: str,
                 tracking_time: int,
                 transport_time: int,
                 **kwargs):
        """
        :param location_stack: 
           The location stack is an ordered list (stack), that contains a hierarchy of location contexts that 
            deterministically describes where an event took place from global to specific. 
            The whole stack (list) is needed to exactly pinpoint where in the UI the event originated.
        :param global_contexts: 
           Global contexts add global / general information about the event. They carry information that is not 
            related to where the Event originated (location), such as device, platform or business data.
        :param id: 
           Unique identifier for a specific instance of an event. Typically UUID's are a good way of 
            implementing this. On the collector side, events should be unique, this means duplicate id's result 
            in `not ok` events.
        :param tracking_time: 
           Timestamp indicating when the event was generated (added to the transport queue).
        :param transport_time: 
           Timestamp indicating when the event was sent (transported) to the collector.
        """

        NonInteractiveEvent.__init__(self,
                                     location_stack=location_stack,
                                     global_contexts=global_contexts,
                                     id=id,
                                     tracking_time=tracking_time,
                                     transport_time=transport_time)


class URLChangeEvent(NonInteractiveEvent):
    """
    non interactive event that is emitted when the URL of a page has changed. Also contains a `WebDocumentContext`
    that details the change.

    Attributes:
        location_stack (List[AbstractLocationContext]):
            The location stack is an ordered list (stack), that contains a hierarchy of location contexts that 
            deterministically describes where an event took place from global to specific. 
            The whole stack (list) is needed to exactly pinpoint where in the UI the event originated.
        global_contexts (List[AbstractGlobalContext]):
            Global contexts add global / general information about the event. They carry information that is not 
            related to where the Event originated (location), such as device, platform or business data.
        id (str):
            Unique identifier for a specific instance of an event. Typically UUID's are a good way of 
            implementing this. On the collector side, events should be unique, this means duplicate id's result 
            in `not ok` events.
        tracking_time (int):
            Timestamp indicating when the event was generated (added to the transport queue).
        transport_time (int):
            Timestamp indicating when the event was sent (transported) to the collector.
    """

    def __init__(self,
                 location_stack: List[AbstractLocationContext],
                 global_contexts: List[AbstractGlobalContext],
                 id: str,
                 tracking_time: int,
                 transport_time: int,
                 **kwargs):
        """
        :param location_stack: 
           The location stack is an ordered list (stack), that contains a hierarchy of location contexts that 
            deterministically describes where an event took place from global to specific. 
            The whole stack (list) is needed to exactly pinpoint where in the UI the event originated.
        :param global_contexts: 
           Global contexts add global / general information about the event. They carry information that is not 
            related to where the Event originated (location), such as device, platform or business data.
        :param id: 
           Unique identifier for a specific instance of an event. Typically UUID's are a good way of 
            implementing this. On the collector side, events should be unique, this means duplicate id's result 
            in `not ok` events.
        :param tracking_time: 
           Timestamp indicating when the event was generated (added to the transport queue).
        :param transport_time: 
           Timestamp indicating when the event was sent (transported) to the collector.
        """

        NonInteractiveEvent.__init__(self,
                                     location_stack=location_stack,
                                     global_contexts=global_contexts,
                                     id=id,
                                     tracking_time=tracking_time,
                                     transport_time=transport_time)


class ApplicationLoadedEvent(NonInteractiveEvent):
    """
    non interactive event that is emitted after an application (eg. SPA) has finished loading.
    Contains a `SectionContext`

    Attributes:
        location_stack (List[AbstractLocationContext]):
            The location stack is an ordered list (stack), that contains a hierarchy of location contexts that 
            deterministically describes where an event took place from global to specific. 
            The whole stack (list) is needed to exactly pinpoint where in the UI the event originated.
        global_contexts (List[AbstractGlobalContext]):
            Global contexts add global / general information about the event. They carry information that is not 
            related to where the Event originated (location), such as device, platform or business data.
        id (str):
            Unique identifier for a specific instance of an event. Typically UUID's are a good way of 
            implementing this. On the collector side, events should be unique, this means duplicate id's result 
            in `not ok` events.
        tracking_time (int):
            Timestamp indicating when the event was generated (added to the transport queue).
        transport_time (int):
            Timestamp indicating when the event was sent (transported) to the collector.
    """

    def __init__(self,
                 location_stack: List[AbstractLocationContext],
                 global_contexts: List[AbstractGlobalContext],
                 id: str,
                 tracking_time: int,
                 transport_time: int,
                 **kwargs):
        """
        :param location_stack: 
           The location stack is an ordered list (stack), that contains a hierarchy of location contexts that 
            deterministically describes where an event took place from global to specific. 
            The whole stack (list) is needed to exactly pinpoint where in the UI the event originated.
        :param global_contexts: 
           Global contexts add global / general information about the event. They carry information that is not 
            related to where the Event originated (location), such as device, platform or business data.
        :param id: 
           Unique identifier for a specific instance of an event. Typically UUID's are a good way of 
            implementing this. On the collector side, events should be unique, this means duplicate id's result 
            in `not ok` events.
        :param tracking_time: 
           Timestamp indicating when the event was generated (added to the transport queue).
        :param transport_time: 
           Timestamp indicating when the event was sent (transported) to the collector.
        """

        NonInteractiveEvent.__init__(self,
                                     location_stack=location_stack,
                                     global_contexts=global_contexts,
                                     id=id,
                                     tracking_time=tracking_time,
                                     transport_time=transport_time)


class SectionVisibleEvent(NonInteractiveEvent):
    """
    Non interactive event, emitted after a section (`SectionContext`) has become visible.

    Attributes:
        location_stack (List[AbstractLocationContext]):
            The location stack is an ordered list (stack), that contains a hierarchy of location contexts that 
            deterministically describes where an event took place from global to specific. 
            The whole stack (list) is needed to exactly pinpoint where in the UI the event originated.
        global_contexts (List[AbstractGlobalContext]):
            Global contexts add global / general information about the event. They carry information that is not 
            related to where the Event originated (location), such as device, platform or business data.
        id (str):
            Unique identifier for a specific instance of an event. Typically UUID's are a good way of 
            implementing this. On the collector side, events should be unique, this means duplicate id's result 
            in `not ok` events.
        tracking_time (int):
            Timestamp indicating when the event was generated (added to the transport queue).
        transport_time (int):
            Timestamp indicating when the event was sent (transported) to the collector.
    """

    def __init__(self,
                 location_stack: List[AbstractLocationContext],
                 global_contexts: List[AbstractGlobalContext],
                 id: str,
                 tracking_time: int,
                 transport_time: int,
                 **kwargs):
        """
        :param location_stack: 
           The location stack is an ordered list (stack), that contains a hierarchy of location contexts that 
            deterministically describes where an event took place from global to specific. 
            The whole stack (list) is needed to exactly pinpoint where in the UI the event originated.
        :param global_contexts: 
           Global contexts add global / general information about the event. They carry information that is not 
            related to where the Event originated (location), such as device, platform or business data.
        :param id: 
           Unique identifier for a specific instance of an event. Typically UUID's are a good way of 
            implementing this. On the collector side, events should be unique, this means duplicate id's result 
            in `not ok` events.
        :param tracking_time: 
           Timestamp indicating when the event was generated (added to the transport queue).
        :param transport_time: 
           Timestamp indicating when the event was sent (transported) to the collector.
        """

        NonInteractiveEvent.__init__(self,
                                     location_stack=location_stack,
                                     global_contexts=global_contexts,
                                     id=id,
                                     tracking_time=tracking_time,
                                     transport_time=transport_time)


class SectionHiddenEvent(NonInteractiveEvent):
    """
    Non interactive event, emitted after a section (`SectionContext`) has become invisible.

    Attributes:
        location_stack (List[AbstractLocationContext]):
            The location stack is an ordered list (stack), that contains a hierarchy of location contexts that 
            deterministically describes where an event took place from global to specific. 
            The whole stack (list) is needed to exactly pinpoint where in the UI the event originated.
        global_contexts (List[AbstractGlobalContext]):
            Global contexts add global / general information about the event. They carry information that is not 
            related to where the Event originated (location), such as device, platform or business data.
        id (str):
            Unique identifier for a specific instance of an event. Typically UUID's are a good way of 
            implementing this. On the collector side, events should be unique, this means duplicate id's result 
            in `not ok` events.
        tracking_time (int):
            Timestamp indicating when the event was generated (added to the transport queue).
        transport_time (int):
            Timestamp indicating when the event was sent (transported) to the collector.
    """

    def __init__(self,
                 location_stack: List[AbstractLocationContext],
                 global_contexts: List[AbstractGlobalContext],
                 id: str,
                 tracking_time: int,
                 transport_time: int,
                 **kwargs):
        """
        :param location_stack: 
           The location stack is an ordered list (stack), that contains a hierarchy of location contexts that 
            deterministically describes where an event took place from global to specific. 
            The whole stack (list) is needed to exactly pinpoint where in the UI the event originated.
        :param global_contexts: 
           Global contexts add global / general information about the event. They carry information that is not 
            related to where the Event originated (location), such as device, platform or business data.
        :param id: 
           Unique identifier for a specific instance of an event. Typically UUID's are a good way of 
            implementing this. On the collector side, events should be unique, this means duplicate id's result 
            in `not ok` events.
        :param tracking_time: 
           Timestamp indicating when the event was generated (added to the transport queue).
        :param transport_time: 
           Timestamp indicating when the event was sent (transported) to the collector.
        """

        NonInteractiveEvent.__init__(self,
                                     location_stack=location_stack,
                                     global_contexts=global_contexts,
                                     id=id,
                                     tracking_time=tracking_time,
                                     transport_time=transport_time)


class VideoEvent(NonInteractiveEvent):
    """
    Family of non interactive events triggered by a video player

    Attributes:
        location_stack (List[AbstractLocationContext]):
            The location stack is an ordered list (stack), that contains a hierarchy of location contexts that 
            deterministically describes where an event took place from global to specific. 
            The whole stack (list) is needed to exactly pinpoint where in the UI the event originated.
        global_contexts (List[AbstractGlobalContext]):
            Global contexts add global / general information about the event. They carry information that is not 
            related to where the Event originated (location), such as device, platform or business data.
        id (str):
            Unique identifier for a specific instance of an event. Typically UUID's are a good way of 
            implementing this. On the collector side, events should be unique, this means duplicate id's result 
            in `not ok` events.
        tracking_time (int):
            Timestamp indicating when the event was generated (added to the transport queue).
        transport_time (int):
            Timestamp indicating when the event was sent (transported) to the collector.
    """

    def __init__(self,
                 location_stack: List[AbstractLocationContext],
                 global_contexts: List[AbstractGlobalContext],
                 id: str,
                 tracking_time: int,
                 transport_time: int,
                 **kwargs):
        """
        :param location_stack: 
           The location stack is an ordered list (stack), that contains a hierarchy of location contexts that 
            deterministically describes where an event took place from global to specific. 
            The whole stack (list) is needed to exactly pinpoint where in the UI the event originated.
        :param global_contexts: 
           Global contexts add global / general information about the event. They carry information that is not 
            related to where the Event originated (location), such as device, platform or business data.
        :param id: 
           Unique identifier for a specific instance of an event. Typically UUID's are a good way of 
            implementing this. On the collector side, events should be unique, this means duplicate id's result 
            in `not ok` events.
        :param tracking_time: 
           Timestamp indicating when the event was generated (added to the transport queue).
        :param transport_time: 
           Timestamp indicating when the event was sent (transported) to the collector.
        """

        NonInteractiveEvent.__init__(self,
                                     location_stack=location_stack,
                                     global_contexts=global_contexts,
                                     id=id,
                                     tracking_time=tracking_time,
                                     transport_time=transport_time)


class VideoLoadEvent(VideoEvent):
    """
    Event emitted after a video completes loading.

    Attributes:
        location_stack (List[AbstractLocationContext]):
            The location stack is an ordered list (stack), that contains a hierarchy of location contexts that 
            deterministically describes where an event took place from global to specific. 
            The whole stack (list) is needed to exactly pinpoint where in the UI the event originated.
        global_contexts (List[AbstractGlobalContext]):
            Global contexts add global / general information about the event. They carry information that is not 
            related to where the Event originated (location), such as device, platform or business data.
        id (str):
            Unique identifier for a specific instance of an event. Typically UUID's are a good way of 
            implementing this. On the collector side, events should be unique, this means duplicate id's result 
            in `not ok` events.
        tracking_time (int):
            Timestamp indicating when the event was generated (added to the transport queue).
        transport_time (int):
            Timestamp indicating when the event was sent (transported) to the collector.
    """

    def __init__(self,
                 location_stack: List[AbstractLocationContext],
                 global_contexts: List[AbstractGlobalContext],
                 id: str,
                 tracking_time: int,
                 transport_time: int,
                 **kwargs):
        """
        :param location_stack: 
           The location stack is an ordered list (stack), that contains a hierarchy of location contexts that 
            deterministically describes where an event took place from global to specific. 
            The whole stack (list) is needed to exactly pinpoint where in the UI the event originated.
        :param global_contexts: 
           Global contexts add global / general information about the event. They carry information that is not 
            related to where the Event originated (location), such as device, platform or business data.
        :param id: 
           Unique identifier for a specific instance of an event. Typically UUID's are a good way of 
            implementing this. On the collector side, events should be unique, this means duplicate id's result 
            in `not ok` events.
        :param tracking_time: 
           Timestamp indicating when the event was generated (added to the transport queue).
        :param transport_time: 
           Timestamp indicating when the event was sent (transported) to the collector.
        """

        VideoEvent.__init__(self,
                            location_stack=location_stack,
                            global_contexts=global_contexts,
                            id=id,
                            tracking_time=tracking_time,
                            transport_time=transport_time)


class VideoStartEvent(VideoEvent):
    """
    Event emitted after a video starts playback.

    Attributes:
        location_stack (List[AbstractLocationContext]):
            The location stack is an ordered list (stack), that contains a hierarchy of location contexts that 
            deterministically describes where an event took place from global to specific. 
            The whole stack (list) is needed to exactly pinpoint where in the UI the event originated.
        global_contexts (List[AbstractGlobalContext]):
            Global contexts add global / general information about the event. They carry information that is not 
            related to where the Event originated (location), such as device, platform or business data.
        id (str):
            Unique identifier for a specific instance of an event. Typically UUID's are a good way of 
            implementing this. On the collector side, events should be unique, this means duplicate id's result 
            in `not ok` events.
        tracking_time (int):
            Timestamp indicating when the event was generated (added to the transport queue).
        transport_time (int):
            Timestamp indicating when the event was sent (transported) to the collector.
    """

    def __init__(self,
                 location_stack: List[AbstractLocationContext],
                 global_contexts: List[AbstractGlobalContext],
                 id: str,
                 tracking_time: int,
                 transport_time: int,
                 **kwargs):
        """
        :param location_stack: 
           The location stack is an ordered list (stack), that contains a hierarchy of location contexts that 
            deterministically describes where an event took place from global to specific. 
            The whole stack (list) is needed to exactly pinpoint where in the UI the event originated.
        :param global_contexts: 
           Global contexts add global / general information about the event. They carry information that is not 
            related to where the Event originated (location), such as device, platform or business data.
        :param id: 
           Unique identifier for a specific instance of an event. Typically UUID's are a good way of 
            implementing this. On the collector side, events should be unique, this means duplicate id's result 
            in `not ok` events.
        :param tracking_time: 
           Timestamp indicating when the event was generated (added to the transport queue).
        :param transport_time: 
           Timestamp indicating when the event was sent (transported) to the collector.
        """

        VideoEvent.__init__(self,
                            location_stack=location_stack,
                            global_contexts=global_contexts,
                            id=id,
                            tracking_time=tracking_time,
                            transport_time=transport_time)


class VideoStopEvent(VideoEvent):
    """
    Event emitted after a video stops playback.

    Attributes:
        location_stack (List[AbstractLocationContext]):
            The location stack is an ordered list (stack), that contains a hierarchy of location contexts that 
            deterministically describes where an event took place from global to specific. 
            The whole stack (list) is needed to exactly pinpoint where in the UI the event originated.
        global_contexts (List[AbstractGlobalContext]):
            Global contexts add global / general information about the event. They carry information that is not 
            related to where the Event originated (location), such as device, platform or business data.
        id (str):
            Unique identifier for a specific instance of an event. Typically UUID's are a good way of 
            implementing this. On the collector side, events should be unique, this means duplicate id's result 
            in `not ok` events.
        tracking_time (int):
            Timestamp indicating when the event was generated (added to the transport queue).
        transport_time (int):
            Timestamp indicating when the event was sent (transported) to the collector.
    """

    def __init__(self,
                 location_stack: List[AbstractLocationContext],
                 global_contexts: List[AbstractGlobalContext],
                 id: str,
                 tracking_time: int,
                 transport_time: int,
                 **kwargs):
        """
        :param location_stack: 
           The location stack is an ordered list (stack), that contains a hierarchy of location contexts that 
            deterministically describes where an event took place from global to specific. 
            The whole stack (list) is needed to exactly pinpoint where in the UI the event originated.
        :param global_contexts: 
           Global contexts add global / general information about the event. They carry information that is not 
            related to where the Event originated (location), such as device, platform or business data.
        :param id: 
           Unique identifier for a specific instance of an event. Typically UUID's are a good way of 
            implementing this. On the collector side, events should be unique, this means duplicate id's result 
            in `not ok` events.
        :param tracking_time: 
           Timestamp indicating when the event was generated (added to the transport queue).
        :param transport_time: 
           Timestamp indicating when the event was sent (transported) to the collector.
        """

        VideoEvent.__init__(self,
                            location_stack=location_stack,
                            global_contexts=global_contexts,
                            id=id,
                            tracking_time=tracking_time,
                            transport_time=transport_time)


class VideoPauseEvent(VideoEvent):
    """
    Event emitted after a video pauses playback (toggle).

    Attributes:
        location_stack (List[AbstractLocationContext]):
            The location stack is an ordered list (stack), that contains a hierarchy of location contexts that 
            deterministically describes where an event took place from global to specific. 
            The whole stack (list) is needed to exactly pinpoint where in the UI the event originated.
        global_contexts (List[AbstractGlobalContext]):
            Global contexts add global / general information about the event. They carry information that is not 
            related to where the Event originated (location), such as device, platform or business data.
        id (str):
            Unique identifier for a specific instance of an event. Typically UUID's are a good way of 
            implementing this. On the collector side, events should be unique, this means duplicate id's result 
            in `not ok` events.
        tracking_time (int):
            Timestamp indicating when the event was generated (added to the transport queue).
        transport_time (int):
            Timestamp indicating when the event was sent (transported) to the collector.
    """

    def __init__(self,
                 location_stack: List[AbstractLocationContext],
                 global_contexts: List[AbstractGlobalContext],
                 id: str,
                 tracking_time: int,
                 transport_time: int,
                 **kwargs):
        """
        :param location_stack: 
           The location stack is an ordered list (stack), that contains a hierarchy of location contexts that 
            deterministically describes where an event took place from global to specific. 
            The whole stack (list) is needed to exactly pinpoint where in the UI the event originated.
        :param global_contexts: 
           Global contexts add global / general information about the event. They carry information that is not 
            related to where the Event originated (location), such as device, platform or business data.
        :param id: 
           Unique identifier for a specific instance of an event. Typically UUID's are a good way of 
            implementing this. On the collector side, events should be unique, this means duplicate id's result 
            in `not ok` events.
        :param tracking_time: 
           Timestamp indicating when the event was generated (added to the transport queue).
        :param transport_time: 
           Timestamp indicating when the event was sent (transported) to the collector.
        """

        VideoEvent.__init__(self,
                            location_stack=location_stack,
                            global_contexts=global_contexts,
                            id=id,
                            tracking_time=tracking_time,
                            transport_time=transport_time)


class InteractiveEvent(AbstractEvent):
    """
    Events that are the direct result of a user interaction. Eg. a Button Click

    Attributes:
        location_stack (List[AbstractLocationContext]):
            The location stack is an ordered list (stack), that contains a hierarchy of location contexts that 
            deterministically describes where an event took place from global to specific. 
            The whole stack (list) is needed to exactly pinpoint where in the UI the event originated.
        global_contexts (List[AbstractGlobalContext]):
            Global contexts add global / general information about the event. They carry information that is not 
            related to where the Event originated (location), such as device, platform or business data.
        id (str):
            Unique identifier for a specific instance of an event. Typically UUID's are a good way of 
            implementing this. On the collector side, events should be unique, this means duplicate id's result 
            in `not ok` events.
        tracking_time (int):
            Timestamp indicating when the event was generated (added to the transport queue).
        transport_time (int):
            Timestamp indicating when the event was sent (transported) to the collector.
    """

    def __init__(self,
                 location_stack: List[AbstractLocationContext],
                 global_contexts: List[AbstractGlobalContext],
                 id: str,
                 tracking_time: int,
                 transport_time: int,
                 **kwargs):
        """
        :param location_stack: 
           The location stack is an ordered list (stack), that contains a hierarchy of location contexts that 
            deterministically describes where an event took place from global to specific. 
            The whole stack (list) is needed to exactly pinpoint where in the UI the event originated.
        :param global_contexts: 
           Global contexts add global / general information about the event. They carry information that is not 
            related to where the Event originated (location), such as device, platform or business data.
        :param id: 
           Unique identifier for a specific instance of an event. Typically UUID's are a good way of 
            implementing this. On the collector side, events should be unique, this means duplicate id's result 
            in `not ok` events.
        :param tracking_time: 
           Timestamp indicating when the event was generated (added to the transport queue).
        :param transport_time: 
           Timestamp indicating when the event was sent (transported) to the collector.
        """

        AbstractEvent.__init__(self,
                               location_stack=location_stack,
                               global_contexts=global_contexts,
                               id=id,
                               tracking_time=tracking_time,
                               transport_time=transport_time)


class ClickEvent(InteractiveEvent):
    """
    Event triggered by a user clicking on an element

    Attributes:
        location_stack (List[AbstractLocationContext]):
            The location stack is an ordered list (stack), that contains a hierarchy of location contexts that 
            deterministically describes where an event took place from global to specific. 
            The whole stack (list) is needed to exactly pinpoint where in the UI the event originated.
        global_contexts (List[AbstractGlobalContext]):
            Global contexts add global / general information about the event. They carry information that is not 
            related to where the Event originated (location), such as device, platform or business data.
        id (str):
            Unique identifier for a specific instance of an event. Typically UUID's are a good way of 
            implementing this. On the collector side, events should be unique, this means duplicate id's result 
            in `not ok` events.
        tracking_time (int):
            Timestamp indicating when the event was generated (added to the transport queue).
        transport_time (int):
            Timestamp indicating when the event was sent (transported) to the collector.
    """

    def __init__(self,
                 location_stack: List[AbstractLocationContext],
                 global_contexts: List[AbstractGlobalContext],
                 id: str,
                 tracking_time: int,
                 transport_time: int,
                 **kwargs):
        """
        :param location_stack: 
           The location stack is an ordered list (stack), that contains a hierarchy of location contexts that 
            deterministically describes where an event took place from global to specific. 
            The whole stack (list) is needed to exactly pinpoint where in the UI the event originated.
        :param global_contexts: 
           Global contexts add global / general information about the event. They carry information that is not 
            related to where the Event originated (location), such as device, platform or business data.
        :param id: 
           Unique identifier for a specific instance of an event. Typically UUID's are a good way of 
            implementing this. On the collector side, events should be unique, this means duplicate id's result 
            in `not ok` events.
        :param tracking_time: 
           Timestamp indicating when the event was generated (added to the transport queue).
        :param transport_time: 
           Timestamp indicating when the event was sent (transported) to the collector.
        """

        InteractiveEvent.__init__(self,
                                  location_stack=location_stack,
                                  global_contexts=global_contexts,
                                  id=id,
                                  tracking_time=tracking_time,
                                  transport_time=transport_time)


class InputChangeEvent(InteractiveEvent):
    """
    Event triggered when user input is modified.

    Attributes:
        location_stack (List[AbstractLocationContext]):
            The location stack is an ordered list (stack), that contains a hierarchy of location contexts that 
            deterministically describes where an event took place from global to specific. 
            The whole stack (list) is needed to exactly pinpoint where in the UI the event originated.
        global_contexts (List[AbstractGlobalContext]):
            Global contexts add global / general information about the event. They carry information that is not 
            related to where the Event originated (location), such as device, platform or business data.
        id (str):
            Unique identifier for a specific instance of an event. Typically UUID's are a good way of 
            implementing this. On the collector side, events should be unique, this means duplicate id's result 
            in `not ok` events.
        tracking_time (int):
            Timestamp indicating when the event was generated (added to the transport queue).
        transport_time (int):
            Timestamp indicating when the event was sent (transported) to the collector.
    """

    def __init__(self,
                 location_stack: List[AbstractLocationContext],
                 global_contexts: List[AbstractGlobalContext],
                 id: str,
                 tracking_time: int,
                 transport_time: int,
                 **kwargs):
        """
        :param location_stack: 
           The location stack is an ordered list (stack), that contains a hierarchy of location contexts that 
            deterministically describes where an event took place from global to specific. 
            The whole stack (list) is needed to exactly pinpoint where in the UI the event originated.
        :param global_contexts: 
           Global contexts add global / general information about the event. They carry information that is not 
            related to where the Event originated (location), such as device, platform or business data.
        :param id: 
           Unique identifier for a specific instance of an event. Typically UUID's are a good way of 
            implementing this. On the collector side, events should be unique, this means duplicate id's result 
            in `not ok` events.
        :param tracking_time: 
           Timestamp indicating when the event was generated (added to the transport queue).
        :param transport_time: 
           Timestamp indicating when the event was sent (transported) to the collector.
        """

        InteractiveEvent.__init__(self,
                                  location_stack=location_stack,
                                  global_contexts=global_contexts,
                                  id=id,
                                  tracking_time=tracking_time,
                                  transport_time=transport_time)


def make_context(_context_type: str, **kwargs) -> AbstractContext:
    if _context_type == "AbstractContext":
        return AbstractContext(**kwargs)
    if _context_type == "AbstractLocationContext":
        return AbstractLocationContext(**kwargs)
    if _context_type == "AbstractGlobalContext":
        return AbstractGlobalContext(**kwargs)
    if _context_type == "ApplicationContext":
        return ApplicationContext(**kwargs)
    if _context_type == "SectionContext":
        return SectionContext(**kwargs)
    if _context_type == "WebDocumentContext":
        return WebDocumentContext(**kwargs)
    if _context_type == "ScreenContext":
        return ScreenContext(**kwargs)
    if _context_type == "ExpandableSectionContext":
        return ExpandableSectionContext(**kwargs)
    if _context_type == "MediaPlayerContext":
        return MediaPlayerContext(**kwargs)
    if _context_type == "NavigationContext":
        return NavigationContext(**kwargs)
    if _context_type == "OverlayContext":
        return OverlayContext(**kwargs)
    if _context_type == "ItemContext":
        return ItemContext(**kwargs)
    if _context_type == "InputContext":
        return InputContext(**kwargs)
    if _context_type == "ActionContext":
        return ActionContext(**kwargs)
    if _context_type == "ButtonContext":
        return ButtonContext(**kwargs)
    if _context_type == "LinkContext":
        return LinkContext(**kwargs)
    if _context_type == "DeviceContext":
        return DeviceContext(**kwargs)
    if _context_type == "ErrorContext":
        return ErrorContext(**kwargs)
    if _context_type == "CookieIdContext":
        return CookieIdContext(**kwargs)
    if _context_type == "SessionContext":
        return SessionContext(**kwargs)
    if _context_type == "HttpContext":
        return HttpContext(**kwargs)
    return AbstractContext(**kwargs)


def make_event(event: str, **kwargs) -> AbstractEvent:
    if event == "AbstractEvent":
        return AbstractEvent(**kwargs)
    if event == "NonInteractiveEvent":
        return NonInteractiveEvent(**kwargs)
    if event == "DocumentLoadedEvent":
        return DocumentLoadedEvent(**kwargs)
    if event == "URLChangeEvent":
        return URLChangeEvent(**kwargs)
    if event == "ApplicationLoadedEvent":
        return ApplicationLoadedEvent(**kwargs)
    if event == "SectionVisibleEvent":
        return SectionVisibleEvent(**kwargs)
    if event == "SectionHiddenEvent":
        return SectionHiddenEvent(**kwargs)
    if event == "VideoEvent":
        return VideoEvent(**kwargs)
    if event == "VideoLoadEvent":
        return VideoLoadEvent(**kwargs)
    if event == "VideoStartEvent":
        return VideoStartEvent(**kwargs)
    if event == "VideoStopEvent":
        return VideoStopEvent(**kwargs)
    if event == "VideoPauseEvent":
        return VideoPauseEvent(**kwargs)
    if event == "InteractiveEvent":
        return InteractiveEvent(**kwargs)
    if event == "ClickEvent":
        return ClickEvent(**kwargs)
    if event == "InputChangeEvent":
        return InputChangeEvent(**kwargs)
    return AbstractEvent(**kwargs)


def make_event_from_dict(obj: Dict[str, Any]) -> AbstractEvent:
    obj['location_stack'] = [make_context(**c) for c in obj['location_stack']]
    obj['global_contexts'] = [make_context(
        **c) for c in obj['global_contexts']]

    return make_event(**obj)
